package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Portfolio;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.PortfolioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final ActorRepository actorRepository;
    private final BusinessRepository businessRepository;

    public PortfolioService(PortfolioRepository portfolioRepository,
                            ActorRepository actorRepository,
                            BusinessRepository businessRepository) {
        this.portfolioRepository = portfolioRepository;
        this.actorRepository = actorRepository;
        this.businessRepository = businessRepository;
    }

    public List<Portfolio> findAll() {
        return portfolioRepository.findAll();
    }

    public Optional<Portfolio> findById(UUID id) {
        return portfolioRepository.findById(id);
    }

    public Optional<Portfolio> findByActorId(UUID actorId) {
        return portfolioRepository.findByActorId(actorId);
    }

    public Portfolio save(UUID actorId, Portfolio portfolio) {
        if (portfolioRepository.existsByActorId(actorId)) {
            throw new RuntimeException("Cet acteur a déjà un portfolio : " + actorId);
        }
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Acteur non trouvé : " + actorId));
        portfolio.setActor(actor);
        return portfolioRepository.save(portfolio);
    }

    public Portfolio addBusiness(UUID portfolioId, UUID businessId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio non trouvé : " + portfolioId));
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Métier non trouvé : " + businessId));
        portfolio.getBusinesses().add(business);
        return portfolioRepository.save(portfolio);
    }

    public Portfolio removeBusiness(UUID portfolioId, UUID businessId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio non trouvé : " + portfolioId));
        portfolio.getBusinesses().removeIf(b -> b.getId().equals(businessId));
        return portfolioRepository.save(portfolio);
    }

    public void deleteById(UUID id) {
        portfolioRepository.deleteById(id);
    }
}