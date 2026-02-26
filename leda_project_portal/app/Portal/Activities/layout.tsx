/**
 * Activities section layout — enforces page-level access control for all
 * routes under /Portal/Activities before rendering children.
 */
import { requirePageAccess } from "@/lib/require-page-access";
  return <>{children}</>;
}
