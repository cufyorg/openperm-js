import { Role } from "./Role";
import { Approval } from "./Approval";
/**
 * The types of the results of a privilege evaluation.
 */
export declare type PrivilegeResult<R extends Role = Role, A extends Approval = Approval> = A | Privilege<R, A>[];
/**
 * The types of a privilege output.
 */
export declare type PrivilegePromise<R extends Role = Role, A extends Approval = Approval> = Promise<PrivilegeResult<R, A>> | PrivilegeResult<R, A>;
/**
 * The type of a privilege function.
 */
export declare type PrivilegeFunction<R extends Role = Role, A extends Approval = Approval> = (role: R) => PrivilegePromise<R, A>;
/**
 * The types of a privilege.
 */
export declare type Privilege<R extends Role = Role, A extends Approval = Approval> = PrivilegePromise<R, A> | PrivilegeFunction<R, A>;
/**
 * Evaluate the given privilege.
 *
 * @param privilege the privilege to be evaluated.
 * @param role the role to evaluate the privilege with.
 * @return the approval objects.
 */
export declare function invokePrivilege<R extends Role = Role, A extends Approval = Approval>(privilege: Privilege<R, A>, role: R): Promise<A[]>;
