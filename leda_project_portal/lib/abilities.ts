import { AbilityBuilder, createMongoAbility } from "@casl/ability"

export type Actions = "write" | "read" | "update" | "delete" | "manage" | "see"
export type Subjects = "Management" | "Maintenance" | "Reports" | "Activities" | "Denial" | "Users" |"all"

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