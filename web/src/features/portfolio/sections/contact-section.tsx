// Contato: cartões uniformes com logo por canal (e-mail, WhatsApp, GitHub...), todos editáveis no painel.

import { ArrowUpRight, Github, Linkedin, Mail, MapPin, MessageCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import type { SiteContent } from '../types';
import { Section } from '@/shared/ui/section';
import { ScrollReveal } from '@/shared/ui/scroll-reveal';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { cn } from '@/shared/lib/cn';

interface ContactSectionProps {
  content: SiteContent;
}

interface Channel {
  key: string;
  label: string;
  value: string;
  href: string | null;
  icon: ComponentType<{ className?: string }>;
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function ContactSection({ content }: ContactSectionProps) {
  const { t, pick } = useI18n();

  const email = pick(content['contact.email']);
  const phone = pick(content['contact.phone']);
  const github = pick(content['contact.github']);
  const linkedin = pick(content['contact.linkedin']);
  const location = pick(content['contact.location']);

  const channels: Channel[] = [
    email && {
      key: 'email',
      label: t.contact.email,
      value: email,
      href: `mailto:${email}`,
      icon: Mail,
    },
    phone && {
      key: 'phone',
      label: t.contact.phone,
      value: phone,
      href: whatsappHref(phone),
      icon: MessageCircle,
    },
    github && {
      key: 'github',
      label: t.contact.github,
      value: github.replace(/^https?:\/\//, ''),
      href: github,
      icon: Github,
    },
    linkedin && {
      key: 'linkedin',
      label: t.contact.linkedin,
      value: linkedin.replace(/^https?:\/\//, ''),
      href: linkedin,
      icon: Linkedin,
    },
    location && {
      key: 'location',
      label: t.contact.location,
      value: location,
      href: null,
      icon: MapPin,
    },
  ].filter(Boolean) as Channel[];

  return (
    <Section id="contact" index={5} title={pick(content['contact.title']) || t.nav.contact}>
      <ScrollReveal>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty">
          {pick(content['contact.body'])}
        </p>
      </ScrollReveal>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {channels.map((channel, index) => {
          const Icon = channel.icon;

          const inner = (
            <>
              <div className="flex min-w-0 items-center gap-4">
                <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="eyebrow">{channel.label}</p>
                  <p className="mt-1 truncate text-sm">{channel.value}</p>
                </div>
              </div>

              {channel.href && (
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              )}
            </>
          );

          const tileClasses = 'flex items-center justify-between gap-4 border border-rule bg-surface/40 p-5';

          return (
            <ScrollReveal key={channel.key} delay={index * 0.05}>
              {channel.href ? (
                <a
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={cn('group tile-hover', tileClasses)}
                >
                  {inner}
                </a>
              ) : (
                <div className={tileClasses}>{inner}</div>
              )}
            </ScrollReveal>
          );
        })}
      </div>
    </Section>
  );
}
