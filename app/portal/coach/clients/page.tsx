import ClientsAdmin from "@/components/portal/ClientsAdmin";
import Shell from "@/components/portal/Shell";
import { disableUser, inviteClient } from "@/lib/portal/actions/coach";
import { shellProps } from "@/lib/portal/actions/shell";
import { forStaff } from "@/lib/portal/data/staff";
import { requireStaff, signedIn } from "@/lib/portal/principal";

export default async function CoachClients() {
  const principal = await requireStaff();
  const user = await signedIn();
  const orgs = await forStaff(principal).listOrgs();

  return (
    <Shell {...shellProps(user, "clients")}>
      <ClientsAdmin orgs={orgs} invite={inviteClient} disable={disableUser} />
    </Shell>
  );
}
