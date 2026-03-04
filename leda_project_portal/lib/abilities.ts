/**
 * CASL ability definitions for the LEDA portal.
 *
 * Defines what actions each role can perform on which subjects.
 * Used by both server-side guards (requireSession, requirePageAccess)
 * and the client-side useUserAbilities hook.
 */
import { AbilityBuilder, createMongoAbility } from "@casl/ability"

/** All possible CRUD-style actions a user can perform. */
export type Actions = "write" | "read" | "update" | "delete" | "manage" | "see"

/** Portal sections and special pseudo-subjects used in ability rules. */
export type Subjects = "Management" | "Maintenance" | "Reports" | "Activities" | "Denial" | "Users" |"all"

/**
 * Builds a CASL ability instance for the given role.
 *
 * - Developer: full access to everything, cannot see the Denial page.
 * - Office Admin: full access to all portal sections but not Users.
 * - Any other role: no access; routed to the Denial subject.
 */
export const defineAbilitesFor = (role: string) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (role === "Developer") {
        can("manage", "all");
        can("manage", "Users");
        cannot("see", "Denial");
    } else if (role === "Office Admin") {
        can("manage", "Management");
        can("manage", "Maintenance"); 
        can("manage", "Reports");
        can("manage", "Activities");
    } else {
        cannot("manage", "all");
        can("see", "Denial");
    }

    return build()
}