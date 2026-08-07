"use client";

import { notFound, useParams } from "next/navigation";
import EntityManager from "@/components/admin/EntityManager";
import { entities } from "@/lib/admin-entities";

export default function ContentAdminPage() {
  const params = useParams<{ entity: string }>();
  const config = entities[params.entity];
  if (!config) notFound();
  return <EntityManager key={config.table} config={config} />;
}
