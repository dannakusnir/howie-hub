import LoginForm from "@/components/portal/LoginForm";
import { previewLogin } from "../actions";
import { previewOnly } from "../gate";

export default function PreviewLogin() {
  previewOnly();
  return <LoginForm request={previewLogin} />;
}
