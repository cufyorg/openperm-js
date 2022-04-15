"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokePrivilege = void 0;
// Static
/**
 * Evaluate the given privilege.
 *
 * @param privilege the privilege to be evaluated.
 * @param role the role to evaluate the privilege with.
 * @return the approval objects.
 */
function invokePrivilege(privilege, role) {
    return __awaiter(this, void 0, void 0, function* () {
        // Promise<PrivilegeResult>
        if (privilege instanceof Promise)
            return invokePrivilege(yield privilege, role);
        // Privilege[]
        if (Array.isArray(privilege))
            return Promise
                .all(privilege.map(it => invokePrivilege(it, role)))
                .then(it => it.flatMap(it => it));
        // Approval
        if (typeof privilege === 'object')
            return [privilege];
        // PrivilegeFunction
        if (typeof privilege === 'function')
            return invokePrivilege(yield privilege(role), role);
        throw new Error('Invalid Privilege Type');
    });
}
exports.invokePrivilege = invokePrivilege;
