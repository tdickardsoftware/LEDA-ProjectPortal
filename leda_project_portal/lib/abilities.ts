import { AbilityBuilder, createMongoAbility } from "@casl/ability"

export type Actions = "write" | "read" | "update" | "delete" | "manage"
export type Subjects = "Management" | "Maintenance" | "Reports" | "Activities" | "all"

export const defineAbilitesFor = (role: string) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (role === "Developer") {
        can("manage", "all");
    } else if (role === "Office Admin") {
        can("manage", "Management");
        can("manage", "Maintenance"); 
        can("manage", "Reports");
        can("manage", "Activities");
    } else {
        cannot("manage", "all");
    }

    return build()
}