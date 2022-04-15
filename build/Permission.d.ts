import { Privilege } from "./Privilege";
import { Approval } from "./Approval";
import { Permit } from "./Permit";
import { Role } from "./Role";
/**
 * The types of the results of a permission evaluation.
 */
export declare type PermissionResult<T = any, R extends Role = Role, A extends Approval = Approval> = A | Permission<T, R, A>[];
/**
 * The types of a permission output.
 */
export declare type PermissionPromise<T = any, R extends Role = Role, A extends Approval = Approval> = Promise<PermissionResult<T, R, A>> | PermissionResult<T, R, A>;
/**
 * The type of a permission function.
 */
export declare type PermissionFunction<T = any, R extends Role = Role, A extends Approval = Approval> = (privilege: Privilege<R, A>, target: T) => PermissionPromise<T, R, A>;
/**
 * The types of a permission.
 */
export declare type Permission<T = any, R extends Role = Role, A extends Approval = Approval> = PermissionPromise<T, R, A> | PermissionFunction<T, R, A>;
/**
 * Check the given permission and throw the error if it fails.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 */
export declare function requirePermission<T = any, R extends Role = Role, A extends Approval = Approval>(permission: Permission<T, R, A>, privilege: Privilege<R, A>, target: T): Promise<T>;
/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permissioned the given permission for the given target.
 */
export declare function isPermissioned<T = any, R extends Role = Role, A extends Approval = Approval>(permission: Permission<T, R, A>, privilege: Privilege<R, A>, target: T): Promise<boolean>;
/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 * @return an approval object.
 */
export declare function checkPermission<T = any, R extends Role = Role, A extends Approval = Approval>(permission: Permission<T, R, A>, privilege: Privilege<R, A>, target: T): Promise<A>;
/**
 * Evaluate the given permission.
 *
 * @param permission the permission to be evaluated.
 * @param privilege the privilege
 * @param target the target to evaluate the permission for.
 * @return the approval objects.
 */
export declare function invokePermission<T = any, R extends Role = Role, A extends Approval = Approval>(permission: Permission<T, R, A>, privilege: Privilege<R, A>, target: T): Promise<A[]>;
/**
 * Permission static utilities.
 */
export declare namespace Permission {
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
    function every<T = any, R extends Role = Role, A extends Approval = Approval>(...permissions: Permission<T, R, A>[]): Permission<T, R, A>;
    /**
     * Return a permission that checks the given `permissions`.
     *
     * If the permissions array is empty, the returned permission will always
     * evaluate to `false`.
     *
     * If at least one permission evaluates to true, the permission will
     * evaluate to `true`.
     */
    function some<T = any, R extends Role = Role, A extends Approval = Approval>(...permissions: Permission<T, R, A>[]): Permission<T, R, A>;
    /**
     * Create a new permission that returns the result of invoking the given
     * permission with the target being the result of invoking the given mapper
     * with the target given to it.
     */
    function map<T = any, U = any, R extends Role = Role, A extends Approval = Approval>(permission: Permission<U, R, A>, mapper: (target: T) => U | Promise<U>): Permission<T, R, A>;
    /**
     * Create a permission that returns the result of checking the given permit.
     */
    function create<T = any, R extends Role = Role, A extends Approval = Approval>(permit: Permit<T, R>): Permission<T, R, A>;
}
