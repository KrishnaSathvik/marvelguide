import Link from "next/link";
import { PageStub } from "@/components/PageStub";

export default function NotFound() {
  return (
    <PageStub kicker="404" title="Not in this universe">
      <p className="mt-6">
        <Link href="/" className="font-label font-bold tracking-wider text-red uppercase">
          Back to home
        </Link>
      </p>
    </PageStub>
  );
}
