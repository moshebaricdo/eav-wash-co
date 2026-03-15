import Link from "next/link";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { SOURCE_LABELS } from "@/lib/db/schema";
import { desc, eq, ilike, and, SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contacts" };

type Props = {
  searchParams: Promise<{ type?: string; q?: string }>;
};

export default async function ContactsPage({ searchParams }: Props) {
  const params = await searchParams;
  const typeFilter = params.type as "lead" | "client" | undefined;
  const searchQuery = params.q;

  const conditions: SQL[] = [];
  if (typeFilter && (typeFilter === "lead" || typeFilter === "client")) {
    conditions.push(eq(contacts.type, typeFilter));
  }
  if (searchQuery) {
    conditions.push(ilike(contacts.name, `%${searchQuery}%`));
  }

  const allContacts = await db
    .select()
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contacts.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
            Contacts
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            {allContacts.length} contact{allContacts.length !== 1 ? "s" : ""}
            {typeFilter ? ` — ${typeFilter === "lead" ? "Leads" : "Clients"}` : ""}
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-md bg-eav-orange px-4 py-2 font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98]"
        >
          New Contact
        </Link>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/contacts"
          className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
            !typeFilter
              ? "bg-eav-black text-eav-white"
              : "bg-eav-white text-eav-muted border border-eav-border hover:bg-eav-surface"
          }`}
        >
          All
        </Link>
        <Link
          href="/contacts?type=lead"
          className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
            typeFilter === "lead"
              ? "bg-eav-black text-eav-white"
              : "bg-eav-white text-eav-muted border border-eav-border hover:bg-eav-surface"
          }`}
        >
          Leads
        </Link>
        <Link
          href="/contacts?type=client"
          className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
            typeFilter === "client"
              ? "bg-eav-black text-eav-white"
              : "bg-eav-white text-eav-muted border border-eav-border hover:bg-eav-surface"
          }`}
        >
          Clients
        </Link>
      </div>

      {/* Search */}
      <form className="max-w-sm">
        <input
          name="q"
          type="text"
          defaultValue={searchQuery}
          placeholder="Search contacts..."
          className="w-full rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2 font-body text-sm text-eav-black outline-none placeholder:text-eav-muted focus:border-eav-orange"
        />
      </form>

      {/* Table */}
      <div className="rounded-lg border border-eav-border bg-eav-white">
        {allContacts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-body text-sm text-eav-muted">
              No contacts found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-eav-border text-left">
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Name
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Email
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Phone
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Type
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Source
                  </th>
                  <th className="px-5 py-3 font-body text-xs font-medium uppercase tracking-wider text-eav-muted">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eav-border">
                {allContacts.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-eav-surface/50"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="font-body text-sm font-medium text-eav-black hover:text-eav-orange"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-eav-black">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-eav-black">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-xs font-medium ${
                          c.type === "client"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {c.type === "client" ? "Client" : "Lead"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-eav-muted">
                      {c.source
                        ? (SOURCE_LABELS[c.source] ?? c.source)
                        : "—"}
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-eav-muted whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
