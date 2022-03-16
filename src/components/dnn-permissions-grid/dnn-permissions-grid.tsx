import { Component, Host, h, Prop, State } from '@stencil/core';
import { ILocalization } from './localisation-interface';
import { IPermissionDefinition, IPermissions, IRolePermission } from './permissions-interface';
import { IRoleGroup } from './role-group-interface';
import { IRole } from './role-interface';

@Component({
  tag: 'dnn-permissions-grid',
  styleUrl: 'dnn-permissions-grid.scss',
  shadow: true,
})
export class DnnPermissionsGrid {

  /** The list of permissions. */
  @Prop({mutable: true}) permissions!: IPermissions;

  /** The list of role groups. */
  @Prop() roleGroups!: IRoleGroup[];

  /** The list of possible roles. */
  @Prop() roles!: IRole[];

  /** Optionally allows localizing the component strings. */
  @Prop() resx: ILocalization = {
    Add: "Add",
    AllRoles: "All Roles",
    FilterByGroup: "Filter By Group",
    GlobalRoles: "Global Roles",
    Role: "Role",
    SelectRole: "Select Role",
  }

  @State() selectedRoleGroupId = -1;
  
  private roleDropDown: HTMLSelectElement;

  private handleRoleGroupChanged(dropdown: HTMLSelectElement): void {
    const index = dropdown.selectedIndex;
    const value = Number.parseInt(dropdown.options[index].value);
    this.selectedRoleGroupId = value;
  }

  private addRole(): void {
    const roleId = Number.parseInt(this.roleDropDown.options[this.roleDropDown.selectedIndex].value);
    const role = this.roles.filter(r => r.RoleId == roleId)[0];
    this.permissions = {
      ...this.permissions,
      rolePermissions: [
        ...this.permissions.rolePermissions,
        {
          default: false,
          locked: false,
          permissions: [],
          roleId: role.RoleId,
          roleName: role.RoleName,
        }
      ]
    }
  }

  private getRoles(){
    const filteredRoles = this.roles.filter(role => 
      !this.permissions.rolePermissions.some(rp => rp.roleId == role.RoleId))
    if (this.selectedRoleGroupId == -2){
      // All Roles
      return filteredRoles;
    }

    if (this.selectedRoleGroupId == -1){
      // Global Roles
      return filteredRoles.filter(role => role.IsSystemRole);
    }
    
    return filteredRoles.filter(role => role.RoleGroupId == this.selectedRoleGroupId);
  }

  private renderCheckBox(rolePermission: IRolePermission, permissionDefinition: IPermissionDefinition) {
    const item = rolePermission.permissions.filter(permission => permission.permissionId == permissionDefinition.permissionId)[0];
    if (rolePermission.locked){
      return(
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g fill="none"><path d="M0 0h24v24H0V0z"/><path d="M0 0h24v24H0V0z" opacity=".87"/></g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
      )
    }

    const checked = item == undefined ? "intermediate" : item.allowAccess ? "checked" : "unchecked";
    return(
      <dnn-checkbox
        use-intermediate
        checked={checked}
        onCheckedchange={e => this.handleRoleChanged(e.detail, rolePermission, permissionDefinition)}
      >
        <div slot="intermediate">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div slot="unchecked">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg>
        </div>
        <span>{permissionDefinition.permissionName}</span>
      </dnn-checkbox>
    )
  }
  
  private handleRoleChanged(
    checked: "checked" | "unchecked" | "intermediate",
    rolePermission: IRolePermission,
    permissionDefinition: IPermissionDefinition
  ): void {
    switch (checked) {
      case "unchecked":
        this.permissions = {
          ...this.permissions,
          rolePermissions: [
            ...this.permissions.rolePermissions.map(r => {
              if (r.roleId != rolePermission.roleId){
                return r;
              }

              const newRolePermission = Object.assign({}, r);
              newRolePermission.permissions = [
                ...newRolePermission.permissions.filter(p => p.permissionId != permissionDefinition.permissionId),
                {
                  allowAccess: false,
                  fullControl: false,
                  permissionCode: permissionDefinition.permissionCode,
                  permissionId: permissionDefinition.permissionId,
                  permissionKey: permissionDefinition.permissionKey,
                  permissionName: permissionDefinition.permissionName,
                  view: false,
                },
              ];
              return newRolePermission;
            }),
          ],
        };
        break;
      case "checked":
        this.permissions = {
          ...this.permissions,
          rolePermissions: [
            ...this.permissions.rolePermissions.map(r => {
              if (r.roleId != rolePermission.roleId){
                return r;
              }

              const newRolePermission = Object.assign({}, r);
              newRolePermission.permissions = [
                ...newRolePermission.permissions.filter(p => p.permissionId != permissionDefinition.permissionId),
                {
                  allowAccess: true,
                  fullControl: false,
                  permissionCode: permissionDefinition.permissionCode,
                  permissionId: permissionDefinition.permissionId,
                  permissionKey: permissionDefinition.permissionKey,
                  permissionName: permissionDefinition.permissionName,
                  view: false,
                },
              ];
              return newRolePermission;
            }),
          ],
        };
        break;
        case "intermediate":
        this.permissions = {
          ...this.permissions,
          rolePermissions: [
            ...this.permissions.rolePermissions.map(r => {
              if (r.roleId != rolePermission.roleId){
                return r;
              }

              const newRolePermission = Object.assign({}, r);
              newRolePermission.permissions = [
                ...newRolePermission.permissions.filter(p => p.permissionId != permissionDefinition.permissionId),
              ];
              return newRolePermission;
            }),
          ],
        };
        break;
      default:
        break;
    }
  }

  private removeRole(rolePermission: IRolePermission): void {
    this.permissions = {
      ...this.permissions,
      rolePermissions: [
        ...this.permissions.rolePermissions.filter(rp => rp.roleId != rolePermission.roleId),
      ],
    };
  }
  
  render() {
    return (
      <Host>
        <div class="add-role-row">
          <div class="dropdown">
            <label>{this.resx.FilterByGroup} :</label>
            <select
              onChange={e => this.handleRoleGroupChanged(e.target as HTMLSelectElement)}
            >
              <option
                value={-2}
                selected={this.selectedRoleGroupId == -2}
              >
                {this.resx.AllRoles}
              </option>
              <option
                value={-1}
                selected={this.selectedRoleGroupId == -1}
              >
                {this.resx.GlobalRoles}
              </option>
              {this.roleGroups.map(roleGroup =>
                <option
                  value={roleGroup.id}
                  selected={this.selectedRoleGroupId == roleGroup.id}
                >
                  {roleGroup.name}
                </option>
              )}
            </select>
          </div>
          <div class="dropdown">
            <label>{this.resx.SelectRole} :</label>
            <select ref={el => this.roleDropDown = el}>
              {this.getRoles().map(role =>
                <option value={role.RoleId}
                >
                  {role.RoleName}
                </option>
              )}
            </select>
          </div>
          <dnn-button
            type="primary"
            onClick={() => this.addRole()}
          >
            {this.resx.Add}
          </dnn-button>
        </div>
        <table class="roles-table">
          <thead>
            <tr>
              <th>{this.resx.Role}</th>
              {this.permissions.permissionDefinitions.map(permissionDefinition =>
                <th>{permissionDefinition.permissionName}</th>
              )}
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {this.permissions.rolePermissions.map(rolePermission =>
              <tr>
                <th>{rolePermission.roleName}</th>
                {this.permissions.permissionDefinitions.map(permissionDefinition =>
                  <td>
                    {this.renderCheckBox(rolePermission, permissionDefinition)}
                  </td>
                )}
                <td>
                  {!rolePermission.default &&
                    <button
                      onClick={() => this.removeRole(rolePermission)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                    </button>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Host>
    );
  }
}