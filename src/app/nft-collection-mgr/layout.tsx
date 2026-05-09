import { redirect } from "next/navigation";
import { HIDE_V11_TOOLS } from "@/const/feature-flags.const";

export default function NftCollectionMgrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (HIDE_V11_TOOLS) redirect("/");
  return <>{children}</>;
}
