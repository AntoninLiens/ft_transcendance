import Users from "src/user/user.entity";

export default class CreateGroupDto {
	name: string;
	owner: Users;
	password: string;
}