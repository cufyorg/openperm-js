import {Role} from "./Role";
import {invokePrivilege, Privilege} from "./Privilege";
import {Approval} from "./Approval";

// Type

/**
 * The types of the results of a permit evaluation.
 */
export type PermitResult<T = any, R extends Role = Role> =
    R | Permit<T, R>[]

/**
 * The types of a permit output.
 */
export type PermitOutput<T = any, R extends Role = Role> =
    Promise<PermitResult<T, R>> | PermitResult<T, R>

/**
 * The type of a permit function.
 */
export type PermitFunction<T = any, R extends Role = Role> =
    (target: T) => PermitOutput<T, R>

/**
 * A permit is a function responsible for creating a set of roles for a target.
 */
export type Permit<T = any, R extends Role = Role> =
    PermitOutput<T, R> | PermitFunction<T, R>

// Static

/**
 * Check the given permit and throw the error if it fails.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 */
export async function requirePermit<T = any, R extends Role = Role, A extends Approval = Approval>(
    permit: Permit<T, R>,
    privilege: Privilege<R, A>,
    target: T
): Promise<T> {
    const approval = await checkPermit(permit, privilege, target)

    if (!approval.value)
        throw approval.error

    return target!
}

/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permitted the given permit for the given target.
 */
export async function isPermitted<T = any, R extends Role = Role, A extends Approval = Approval>(
    permit: Permit<T, R>,
    privilege: Privilege<R, A>,
    target: T
): Promise<boolean> {
    const approval = await checkPermit(permit, privilege, target)

    return approval.value
}

/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return an approval object.
 */
export async function checkPermit<T = any, R extends Role = Role, A extends Approval = Approval>(
    permit: Permit<T, R>,
    privilege: Privilege<R, A>,
    target: T
): Promise<A> {
    const roles = await invokePermit(permit, target)

    if (roles.length === 0)
        return Approval.DENY as A

    for (const role of roles) {
        const approvals = await invokePrivilege(privilege, role)

        if (approvals.length === 0)
            return {value: false, error: role.error} as A

        for (const approval of approvals)
            if (!approval.value)
                return approval
    }

    return {value: true, error: roles[0].error} as A
}

/**
 * Evaluate the given permits
 *
 * @param permit the permit to be evaluated.
 * @param target the target to evaluate the permit for.
 * @return the roles to test when checking the permit.
 */
export async function invokePermit<T = any, R extends Role = Role>(
    permit: Permit<T, R>,
    target: T
): Promise<R[]> {
    // Promise<PermitResult>
    if (permit instanceof Promise)
        return invokePermit(await permit, target)

    // Permit[]
    if (Array.isArray(permit))
        return Promise
            .all(permit.map(it => invokePermit(it, target)))
            .then(it => it.flatMap(it => it))

    // Result
    if (typeof permit === 'object')
        return [permit]

    // PermitFunction
    if (typeof permit === 'function')
        return invokePermit(await permit(target!), target)

    throw new Error('Invalid Permit Type')
}

// Util

export namespace Permit {
    /**
     * Create a permit that returns the result of invoking the given permit with
     * the target being the result of invoking the given mapper with the target given to it.
     */
    export function map<T = any, U = any, R extends Role = Role>(
        permit: Permit<U, R>,
        mapper: (target: T) => U | Promise<U>
    ): Permit<T, R> {
        return async (target) => invokePermit(permit, await mapper(target))
    }
}
