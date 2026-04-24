import React from 'react';

import { Heading } from '@/components/ui/Typography';
import { cn } from '../../lib/utils';

interface SwimlaneProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Horizontal-scroll section with a bold uppercase header. Renders nothing if children is empty/falsy. */
export default function Swimlane({ title, children, className }: SwimlaneProps) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;

  return (
    <section className={cn('mb-8', className)}>
      <Heading level="h3" className="mb-3 px-6">{title}</Heading>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-6 pb-3">
        {children}
      </div>
    </section>
  );
}
