// Raiz do painel: decide entre login e abas (a autorização real é do servidor).

import { useState } from 'react';
import { useSession } from './api/admin.api';
import { AdminLayout, type AdminTab } from './components/admin-layout';
import { LoginPage } from './login-page';
import { AppearancePanel } from './panels/appearance-panel';
import { ContentPanel } from './panels/content-panel';
import { MediaPanel } from './panels/media-panel';
import { ProjectsPanel } from './panels/projects-panel';
import { SkillsPanel } from './panels/skills-panel';
import { TimelinePanel } from './panels/timeline-panel';

const PANELS: Record<AdminTab, () => React.JSX.Element> = {
  skills: SkillsPanel,
  projects: ProjectsPanel,
  timeline: TimelinePanel,
  content: ContentPanel,
  media: MediaPanel,
  appearance: AppearancePanel,
};

export default function AdminApp() {
  const { data, isPending, isError } = useSession();
  const [tab, setTab] = useState<AdminTab>('skills');

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
      </div>
    );
  }

  if (isError || !data?.user) {
    return <LoginPage />;
  }

  const Panel = PANELS[tab];

  return (
    <AdminLayout user={data.user} active={tab} onNavigate={setTab}>
      <Panel />
    </AdminLayout>
  );
}
