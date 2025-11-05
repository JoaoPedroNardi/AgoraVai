package com.biblioteca.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Cliente;
import com.biblioteca.model.Compra;
import com.biblioteca.model.Livro;
import com.biblioteca.repository.ClienteRepository;
import com.biblioteca.repository.CompraRepository;
import com.biblioteca.repository.LivroRepository;

@Service
@Transactional
public class CompraService {
    
    @Autowired
    private CompraRepository compraRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private LivroRepository livroRepository;
    
    /**
     * Lista todas as compras/aluguéis registradas no sistema.
     */
    public List<Compra> listarTodas() {
        return compraRepository.findAll();
    }
    
    /**
     * Busca uma compra pelo seu identificador.
     */
    public Optional<Compra> buscarPorId(Long id) {
        return compraRepository.findById(id);
    }
    
    /**
     * Lista compras/aluguéis de um cliente específico.
     */
    public List<Compra> buscarPorCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
        return compraRepository.findByCliente(cliente);
    }
    
    /**
     * Lista compras por status (ex.: PENDENTE, EM_ANDAMENTO, FINALIZADA, CANCELADA).
     */
    public List<Compra> buscarPorStatus(String status) {
        return compraRepository.findByStatus(status);
    }
    
    /**
     * Cria uma compra/aluguel ajustando tipo, status e datas conforme regras:
     * - Define dtInicio quando ausente
     * - Infere tipo (COMPRA/ALUGUEL) com base no livro
     * - Normaliza status de acordo com o tipo
     */
    public Compra criar(Compra compra) {
        Cliente cliente = clienteRepository.findById(compra.getCliente().getIdPessoa())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
        
        // Campo empAtivo removido: nenhuma validação de ativo/inativo
        
        Livro livro = livroRepository.findById(compra.getLivro().getIdLivro())
            .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));
        
        
        // Define data de início automaticamente
        if (compra.getDtInicio() == null) {
            compra.setDtInicio(LocalDate.now());
        }

        // Harmonizar tipo antes de decisões de status
        if (compra.getTipo() == null) {
            if (livro.getVlAluguel() != null) {
                compra.setTipo(com.biblioteca.model.TipoCompra.ALUGUEL);
            } else {
                compra.setTipo(com.biblioteca.model.TipoCompra.COMPRA);
            }
        }

        // Ajustar status conforme tipo
        String statusReq = compra.getStatus();
        if (compra.getTipo() == com.biblioteca.model.TipoCompra.COMPRA) {
            // Para COMPRA, nunca pendente: se vier vazio ou diferente de FINALIZADA/CANCELADA, definir FINALIZADA
            if (statusReq == null || statusReq.trim().isEmpty() ||
                !("FINALIZADA".equals(statusReq) || "CANCELADA".equals(statusReq))) {
                compra.setStatus("FINALIZADA");
            }
            // Finalizar imediatamente se FINALIZADA e dtFim ausente
            if ("FINALIZADA".equals(compra.getStatus()) && compra.getDtFim() == null) {
                compra.setDtFim(LocalDate.now());
            }
        } else { // ALUGUEL
            if (statusReq == null || statusReq.trim().isEmpty()) {
                compra.setStatus("PENDENTE");
            }
        }
        
        
        compra.setCliente(cliente);
        compra.setLivro(livro);
        return compraRepository.save(compra);
    }
    
    /**
     * Atualiza o status da compra obedecendo transições válidas.
     */
    public Compra atualizarStatus(Long id, String novoStatus) {
        Compra compra = compraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compra não encontrada"));

        String atual = compra.getStatus();
        // Regras de transição válidas
        boolean valido = false;
        switch (atual) {
            case "PENDENTE":
                valido = "EM_ANDAMENTO".equals(novoStatus) || "CANCELADA".equals(novoStatus);
                break;
            case "EM_ANDAMENTO":
                valido = "FINALIZADA".equals(novoStatus) || "CANCELADA".equals(novoStatus);
                break;
            case "FINALIZADA":
            case "CANCELADA":
                valido = false;
                break;
            default:
                valido = false;
        }

        if (!valido) {
            throw new BusinessException("Transição de status inválida de '" + atual + "' para '" + novoStatus + "'");
        }

        // Libera disponibilidade ao finalizar ou cancelar

        compra.setStatus(novoStatus);
        return compraRepository.save(compra);
    }
    
    /**
     * Finaliza a compra: para ALUGUEL, calcula dtFim; para COMPRA, define dtFim atual.
     */
    public Compra finalizarCompra(Long id) {
        Compra compra = compraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compra não encontrada"));
        
        // Para ALUGUEL, manter dtFim como prazo (dtInicio + 30) se existir; não sobrescrever
        if (compra.getTipo() == com.biblioteca.model.TipoCompra.ALUGUEL) {
            if (compra.getDtFim() == null && compra.getDtInicio() != null) {
                compra.setDtFim(compra.getDtInicio().plusDays(30));
            }
        } else {
            // Para COMPRA, dtFim é a data efetiva da compra
            compra.setDtFim(LocalDate.now());
        }
        compra.setStatus("FINALIZADA");
        
        
        return compraRepository.save(compra);
    }

    /**
     * Renova um aluguel adicionando dias ao prazo de dtFim.
     */
    public Compra renovarCompra(Long id, int dias) {
        if (dias <= 0) dias = 15;
        Compra compra = compraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compra não encontrada"));

        if (compra.getTipo() != com.biblioteca.model.TipoCompra.ALUGUEL) {
            throw new BusinessException("A renovação é permitida apenas para compras do tipo ALUGUEL");
        }

        // Base para data final: dtFim atual ou dtInicio + 30 se ainda não definida
        LocalDate baseFinal;
        if (compra.getDtFim() != null) {
            baseFinal = compra.getDtFim();
        } else if (compra.getDtInicio() != null) {
            baseFinal = compra.getDtInicio().plusDays(30);
        } else {
            throw new BusinessException("Compra de aluguel sem data de início");
        }

        LocalDate novaDataFinal = baseFinal.plusDays(dias);
        compra.setDtFim(novaDataFinal);
        // Mantém status como PENDENTE (ativa) ao renovar
        compra.setStatus("PENDENTE");

        // Livro permanece indisponível durante aluguel

        return compraRepository.save(compra);
    }
    
    /**
     * Exclui a compra por ID.
     */
    public void deletar(Long id) {
        Compra compra = compraRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Compra não encontrada"));
        
        
        compraRepository.deleteById(id);
    }
}