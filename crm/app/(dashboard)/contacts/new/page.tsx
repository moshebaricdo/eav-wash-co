import { NewContactForm } from "./new-contact-form";

export const metadata = { title: "New Contact" };

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide text-eav-black">
          New Contact
        </h1>
        <p className="mt-1 font-body text-sm text-eav-muted">
          Add a new contact to the CRM.
        </p>
      </div>
      <NewContactForm />
    </div>
  );
}
