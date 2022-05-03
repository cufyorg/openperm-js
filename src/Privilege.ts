import {Role} from "./Role";
import {Approval} from "./Approval";

// Type

/**
 * The types of the results of a privilege evaluation.
 */
export type PrivilegeResult<R extends Role = Role, A extends Approval = Approval> =
    A | Privilege<R, A>[]

/**
 * The types of a privilege output.
 */
export type PrivilegePromise<R extends Role = Role, A extends Approval = Approval> =
    Promise<PrivilegeResult<R, A>> | PrivilegeResult<R, A>

/**
 * The type of a privilege function.
 */
export type PrivilegeFunction<R extends Role = Role, A extends Approval = Approval> =
    (role: R) => PrivilegePromise<R, A>

/**
 * The types of a privilege.
 */
export type Privilege<R extends Role = Role, A extends Approval = Approval> =
    PrivilegePromise<R, A> | PrivilegeFunction<R, A>

// Static

/**
 * Check the given privilege and throw the error if it fails.
 *
 * @param privilege the privilege to be checked.
 * @param role the role to check the privilege for.
 * @return the role.
 */
export async function requirePrivilege<R extends Role = Role, A extends Approval = Approval>(
    privilege: Privilege<R, A>,
    role: R
): Promise<R> {
    const approval = await checkPrivilege(privilege, role)

    if (!approval.value)
        throw approval.error

    return role
}

/**
 * Check the given privilege.
 *
 * @param privilege the privilege to be checked.
 * @param role the role to check the privilege for.
 * @return true, if the privilege has approval for the given role.
 */
export async function isPrivileged<R extends Role = Role, A extends Approval = Approval>(
    privilege: Privilege<R, A>,
    role: R
): Promise<boolean> {
    const approval = await checkPrivilege(privilege, role)

    return approval.value
}

/**
 * Check the given privilege.
 *
 * @param privilege the privilege to be checked.
 * @param role the role to check the privilege for.
 * @return an approval object.
 */
export async function checkPrivilege<R extends Role = Role, A extends Approval = Approval>(
    privilege: Privilege<R, A>,
    role: R
): Promise<A> {
    const approvals = await invokePrivilege(privilege, role)

    if (approvals.length === 0)
        return {value: false, error: role.error} as A

    for (const approval of approvals)
        if (!approval.value)
            return approval

    return approvals[0]
}

/**
 * Evaluate the given privilege.
 *
 * @param privilege the privilege to be evaluated.
 * @param role the role to evaluate the privilege with.
 * @return the approval objects.
 */
export async function invokePrivilege<R extends Role = Role, A extends Approval = Approval>(
    privilege: Privilege<R, A>,
    role: R
): Promise<A[]> {
    // Promise<PrivilegeResult>
    if (privilege instanceof Promise)
        return invokePrivilege(await privilege, role)

    // Privilege[]
    if (Array.isArray(privilege))
        return Promise
            .all(privilege.map(it => invokePrivilege(it, role)))
            .then(it => it.flatMap(it => it))

    // Approval
    if (typeof privilege === 'object')
        return [privilege]

    // PrivilegeFunction
    if (typeof privilege === 'function')
        return invokePrivilege(await privilege(role), role)

    throw new Error('Invalid Privilege Type')
}

// Util

/**
 * Privilege static utilities.
 */
export namespace Privilege {
    /**
     * Return a privilege that checks the given `privileges`.
     *
     * If the privileges array is empty, the returned privilege will always
     * evaluate to `true`.
     *
     * If at least one privilege evaluates to false, the privilege will
     * evaluate to `false`.
     *
     * If at least on privilege doesn't emit an approval, the privilege will
     * evaluate to `false`.
     */
    export function every<R extends Role = Role, A extends Approval = Approval>(
        ...privileges: Privilege<R, A>[]
    ): Privilege<R, A> {
        return async role => {
            for (const privilege of privileges) {
                const approvals = await invokePrivilege(privilege, role)

                if (approvals.length === 0)
                    return {value: false, error: role.error} as A

                for (const approval of approvals)
                    if (!approval.value)
                        return approval
            }

            return {value: true, error: role.error} as A
        }
    }

    /**
     * Return a privilege that checks the given `privileges`.
     *
     * If the privileges array is empty, the returned privilege will always
     * evaluate to `false`.
     *
     * If at least one privilege evaluates to true, the privilege will
     * evaluate to `true`.
     */
    export function some<R extends Role = Role, A extends Approval = Approval>(
        ...privileges: Privilege<R, A>[]
    ): Privilege<R, A> {
        return async role => {
            for (const privilege of privileges) {
                const approvals = await invokePrivilege(privilege, role)

                for (const approval of approvals)
                    if (approval.value)
                        return approval
            }

            return {value: false, error: role.error} as A
        }
    }

    /**
     * Return a privilege that caches resolved roles.
     */
    export function cached<R extends Role = Role, A extends Approval = Approval>(
        privilege: Privilege<R, A>
    ): Privilege<R, A> {
        const table: Map<R, A> = new Map<R, A>()

        return async role => {
            if (table.has(role)) return table.get(role)!

            const approval = await checkPrivilege(privilege, role)

            table.set(role, approval)
            return approval
        }
    }
}
