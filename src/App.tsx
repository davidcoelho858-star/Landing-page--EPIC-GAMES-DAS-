import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DiscoveryCatalogSection } from './components/DiscoveryCatalogSection';
import { EcosystemStackingSection } from './components/EcosystemStackingSection';
import { SavingsCalculator } from './components/SavingsCalculator';
import { FaqSection } from './components/FaqSection';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { ClaimModal, ModalPayload } from './components/ClaimModal';
import { MeetingSchedulerModal } from './components/MeetingSchedulerModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ProposalFormSection } from './components/ProposalFormSection';
import { ProposalPage } from './components/ProposalPage';
import { AdminPage } from './components/AdminPage';
import { HeroDeal, UserPersona, CatalogGame, EcosystemBundle } from './types';

export default function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (pathname.startsWith('/admin')) {
    return <AdminPage />;
  }

  if (pathname.startsWith('/proposta/')) {
    const token = pathname.replace('/proposta/', '').split('/')[0];
    return <ProposalPage token={token} />;
  }

  const [darkMode, setDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);

  // Meeting scheduler state (Google Calendar integration)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [schedulerTopic, setSchedulerTopic] = useState<string | undefined>(undefined);

  // API Key config modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Triggered when user clicks Download Launcher CTA in Navbar or Banner
  const handleDownloadLauncher = () => {
    setModalPayload({
      type: 'download',
      title: 'Downloading Epic Games Launcher Setup',
      subtitle: 'Official lightweight installer for Windows 10/11 & macOS.',
      perks: [
        'Automatic silent updates',
        'Instant access to 52 free games per year',
        'Direct connection to Epic Online Services & Friends list',
      ],
    });
    setIsModalOpen(true);
  };

  // Open meeting scheduler modal
  const handleOpenScheduler = (topic?: string) => {
    setSchedulerTopic(topic);
    setIsSchedulerOpen(true);
  };

  // Open API Key modal
  const handleOpenApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
  };

  // Triggered when user interacts with a Hero Deal CTA
  const handleHeroDealAction = (deal: HeroDeal) => {
    setModalPayload({
      type: deal.isFree ? 'claim_free' : 'buy_deal',
      title: deal.title,
      subtitle: deal.tagline,
      price: deal.salePrice,
      originalPrice: deal.originalPrice,
      discountPercent: deal.discountPercent,
      ecosystemItem: deal.ecosystemReward ? `${deal.ecosystemReward.item} (${deal.ecosystemReward.game})` : undefined,
      perks: deal.perks,
    });
    setIsModalOpen(true);
  };

  // Triggered when user clicks "View Deals for this Persona"
  const handlePersonaSelect = (persona: UserPersona) => {
    const el = document.getElementById('discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Triggered when user clicks on a game card in discovery catalog
  const handleGameSelect = (game: CatalogGame) => {
    setModalPayload({
      type: game.isFree ? 'claim_free' : 'buy_deal',
      title: game.title,
      subtitle: `${game.genre} by ${game.developer}`,
      price: game.salePrice,
      originalPrice: game.originalPrice,
      discountPercent: game.discountPercent,
      ecosystemItem: game.stackedPerk,
      perks: [
        game.isFree ? '100% Free forever' : `Includes $${game.epicRewardsCashback.toFixed(2)} in Epic Rewards`,
        '14-Day Hassle-free Refund Guarantee',
        'Cloud Saves & Achievements Enabled',
      ],
    });
    setIsModalOpen(true);
  };

  // Triggered when user claims an Ecosystem Cross-Sell Bundle
  const handleClaimBundle = (bundle: EcosystemBundle) => {
    setModalPayload({
      type: 'bundle',
      title: `${bundle.featuredTitle} + ${bundle.giftTitle}`,
      subtitle: `Includes ${bundle.giftValue} credited immediately to your Epic Account.`,
      price: bundle.featuredPrice,
      originalPrice: bundle.originalPrice,
      discountPercent: bundle.discountPercent,
      ecosystemItem: `${bundle.giftTitle} (${bundle.giftGame})`,
      perks: [
        `Save $${(bundle.originalPrice - bundle.featuredPrice).toFixed(2)} on retail cost`,
        `${bundle.giftValue} unlocked in ${bundle.giftGame}`,
        '5% Epic Rewards credited automatically',
      ],
    });
    setIsModalOpen(true);
  };

  // Search submit scrolls to discovery
  const handleSearchSubmit = (query: string) => {
    const el = document.getElementById('discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Secondary CTA handler (scrolls to weekly free games vault)
  const handleExploreFreeVault = () => {
    const el = document.getElementById('discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. Global Navigation Header with High-Contrast Download CTA & Agendar Reunião */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onDownloadClick={handleDownloadLauncher}
        onSearchSubmit={handleSearchSubmit}
        onOpenScheduler={() => handleOpenScheduler()}
        onOpenApiKeyModal={handleOpenApiKeyModal}
      />

      {/* Main Page Sections */}
      <main id="main-content">
        {/* 2. Hero Section with Problem Statement, Max 10-Word Headline, Max 25-Word Subheadline, Live Scarcity Countdown & Price Anchoring Carousel */}
        <HeroSection
          darkMode={darkMode}
          onDealAction={handleHeroDealAction}
          onExploreCatalog={handleExploreFreeVault}
        />

        {/* 3. Target Audience Section: 3 Detailed Personas (Roles, Frustrations, Desired Outcomes, Icons) */}
        <TargetAudienceSection
          darkMode={darkMode}
          onSelectPersonaAction={handlePersonaSelect}
        />

        {/* 4. Solution or Services: 5 Core Features with Outcome-Focused Benefits & Visual Cards */}
        <FeaturesSection
          darkMode={darkMode}
          onFeatureClick={(featureId) => {
            if (featureId === 'weekly-vault' || featureId === 'price-anchoring') {
              handleExploreFreeVault();
            }
          }}
        />

        {/* 5. Algorithmic Discovery Grid (PRD Section 3: "Discover Something New", Spotlight, Weekly Free Vault) */}
        <DiscoveryCatalogSection
          darkMode={darkMode}
          onGameSelect={handleGameSelect}
        />

        {/* 6. Ecosystem & Cross-Selling: Offer Stacking (PRD Section 4: Resident Evil Requiem + Grace Ashcroft Fortnite Outfit) */}
        <EcosystemStackingSection
          darkMode={darkMode}
          onClaimBundle={handleClaimBundle}
        />

        {/* 7. Interactive Savings & Rewards Calculator */}
        <SavingsCalculator
          darkMode={darkMode}
          onCtaClick={handleDownloadLauncher}
        />

        {/* 8. Formulário "Pedido de proposta" com Inteligência Artificial e Cálculo */}
        <ProposalFormSection
          darkMode={darkMode}
        />

        {/* 9. Comprehensive FAQ: 12 Q&As Covering All PRD Objections */}
        <FaqSection
          darkMode={darkMode}
        />

        {/* 9. High-Conversion CTA Banner with Primary & Secondary Buttons + Agendar Reunião */}
        <CtaBanner
          darkMode={darkMode}
          onPrimaryCta={handleDownloadLauncher}
          onSecondaryCta={handleExploreFreeVault}
          onOpenScheduler={() => handleOpenScheduler()}
        />
      </main>

      {/* 10. Footer */}
      <Footer
        darkMode={darkMode}
      />

      {/* Interactive Claim / Download Simulation Modal */}
      <ClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payload={modalPayload}
        darkMode={darkMode}
      />

      {/* Google Calendar Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => {
          setIsSchedulerOpen(false);
          setSchedulerTopic(undefined);
        }}
        darkMode={darkMode}
        initialTopic={schedulerTopic}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        darkMode={darkMode}
      />

      {/* AI Chatbot Widget (Powered by Gemini 3.8 Flash & Google Calendar Connection) */}
      <ChatbotWidget
        darkMode={darkMode}
        onOpenScheduler={handleOpenScheduler}
        onOpenApiKeyModal={handleOpenApiKeyModal}
      />
    </div>
  );
}
