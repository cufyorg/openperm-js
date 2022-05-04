import {Privilege} from "./Privilege";
import {Approval} from "./Approval";
import {checkPermit, Permit} from "./Permit";
import {Role} from "./Role";

// Types

/**
 * The types of the results of a permission evaluation.
 */
export type PermissionResult<T = any, R extends Role = Role, A extends Approval = Approval> =
    A | Permission<T, R, A>[]

/**
 * The types of a permission output.
 */
export type PermissionPromise<T = any, R extends Role = Role, A extends Approval = Approval> =
    Promise<PermissionResult<T, R, A>> | PermissionResult<T, R, A>

/**
 * The type of a permission function.
 */
export type PermissionFunction<T = any, R extends Role = Role, A extends Approval = Approval> =
    (privilege: Privilege<R, A>, target: T) => PermissionPromise<T, R, A>

/**
 * The types of a permission.
 */
export type Permission<T = any, R extends Role = Role, A extends Approval = Approval> =
    PermissionPromise<T, R, A> | PermissionFunction<T, R, A>

// Static

/**
 * Check the given permission and throw the error if it fails.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 */
export async function requirePermission<T = any, R extends Role = Role, A extends Approval = Approval>(
    permission: Permission<T, R, A>,
    privilege: Privilege<R, A>,
    target: T
): Promise<T> {
    const approval = await checkPermission(permission, privilege, target)

    if (!approval.value)
        throw approval.error

    return target!
}

/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permissioned the given permission for the given target.
 */
export async function isPermissioned<T = any, R extends Role = Role, A extends Approval = Approval>(
    permission: Permission<T, R, A>,
    privilege: Privilege<R, A>,
    target: T
): Promise<boolean> {
    const approval = await checkPermission(permission, privilege, target)

    return approval.value
}

/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 * @return an approval object.
 */
export async function checkPermission<T = any, R extends Role = Role, A extends Approval = Approval>(
    permission: Permission<T, R, A>,
    privilege: Privilege<R, A>,
    target: T
): Promise<A> {
    const approvals = await invokePermission(permission, privilege, target)

    if (approvals.length === 0)
        return Approval.DENY as A

    for (const approval of approvals)
        if (!approval.value)
            return approval

    return approvals[0]
}

/**
 * Evaluate the given permission.
 *
 * @param permission the permission to be evaluated.
 * @param privilege the privilege
 * @param target the target to evaluate the permission for.
 * @return the approval objects.
 */
export async function invokePermission<T = any, R extends Role = Role, A extends Approval = Approval>(
    permission: Permission<T, R, A>,
    privilege: Privilege<R, A>,
    target: T
): Promise<A[]> {
    // Promise<PermissionResult>
    if (permission instanceof Promise)
        return invokePermission(await permission, privilege, target)

    // Permission[]
    if (Array.isArray(permission))
        return Promise
            .all(permission.map(it => invokePermission(it, privilege, target)))
            .then(it => it.flatMap(it => it))

    // Approval
    if (typeof permission === 'object')
        return [permission]

    // PermissionFunction
    if (typeof permission === 'function')
        return invokePermission(await permission(privilege, target), privilege, target)

    throw new Error('Invalid Permission Type')
}

// Util

/**
 * Permission static utilities.
 */
export namespace Permission {
    /**
     * Return a permission that checks the given `permissions`.
     *
     * If the permissions array is empty, the returned permission will always
     * evaluate to `true`.
     *
     * If at least one permission evaluates to false, the permission will
     * evaluate to `false`.
     *
     * If at least one permission doesn't emit an approval, the permission will
     * evaluate to `false`.
     */
    export function every<T = any, R extends Role = Role, A extends Approval = Approval>(
        ...permissions: Permission<T, R, A>[]
    ): Permission<T, R, A> {
        return async (privilege, target) => {
            for (const permission of permissions) {
                const approvals = await invokePermission(permission, privilege, target)

                if (approvals.length === 0)
                    return Approval.DENY as A

                for (const approval of approvals)
                    if (!approval.value)
                        return approval
            }

            return {value: true} as A
        }
    }

    /**
     * Return a permission that checks the given `permissions`.
     *
     * If the permissions array is empty, the returned permission will always
     * evaluate to `false`.
     *
     * If at least one permission evaluates to true, the permission will
     * evaluate to `true`.
     */
    export function some<T = any, R extends Role = Role, A extends Approval = Approval>(
        ...permissions: Permission<T, R, A>[]
    ): Permission<T, R, A> {
        return async (privilege, target) => {
            for (const permission of permissions) {
                const approvals = await invokePermission(permission, privilege, target)

                for (const approval of approvals)
                    if (approval.value)
                        return approval
            }

            return {value: false} as A
        }
    }

    /**
     * Create a new permission that returns the result of invoking the given
     * permission with the target being the result of invoking the given mapper
     * with the target given to it.
     */
    export function map<T = any, U = any, R extends Role = Role, A extends Approval = Approval>(
        permission: Permission<U, R, A>,
        mapper: (target: T) => U | Promise<U>
    ): Permission<T, R, A> {
        return async (privilege, target) => invokePermission(permission, privilege, await mapper(target))
    }

    /**
     * Create a permission that returns the result of checking the given permit.
     */
    export function create<T = any, R extends Role = Role, A extends Approval = Approval>(
        permit: Permit<T, R>
    ): Permission<T, R, A> {
        return (privilege, target) => checkPermit(permit, privilege, target)
    }
}
