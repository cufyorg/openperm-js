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
