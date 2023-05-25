import { HttpException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Groups, { GroupStatus } from './group.entity';
import CreateGroupDto from './dto/createGroup.dto';
import Users from 'src/user/user.entity';
import * as bcrypt from "bcrypt";

@Injectable()
export class GroupService {
	constructor (
		@InjectRepository(Groups)
		private readonly groupRepository: Repository<Groups>,
		private readonly userServices: UsersService,
		private readonly chatServices: ChatService
	) {}

	async createGroup(dto: CreateGroupDto) {
		if (dto.name.length > 12) throw new HttpException('Name group is too long', 400);
		if (await this.getGroupByName(dto.name)) {throw new HttpException('Group already exists', 400);}
		let hashedPassword = null;
		if (dto.password) {
			if (dto.password.length < 7) throw new HttpException('Password must be longer than 7 characters', 400);
			hashedPassword = await bcrypt.hash(dto.password, 10);
		}
		const newGroup = await this.groupRepository.create({
			owner: dto.owner,
			name: dto.name,
			password: hashedPassword,
		});
		const group = await this.groupRepository.save(newGroup);
		const chat = await this.chatServices.createChat(null, group);
		await this.groupRepository.update(group.id, { chat: chat });
		return await this.groupRepository.save(group);
	}

	async updatePassword(user: Users, groupName: string, password: string) {
		if (password.length < 7) throw new HttpException('Password must be longer than 7 characters', 400);
		const group = await this.getGroupByName(groupName);
		if (!group) throw new HttpException('Group does not exist', 400);
		if (group.owner.id !== user.id) throw new HttpException('You are not the owner of this group', 400);
		const hashedPassword = await bcrypt.hash(password, 10);
		await this.groupRepository.update(group.id, { password: hashedPassword });
	}

	async mute(user: Users, name: string, timeToMute: number) {
		const group = await this.getGroupByName(name);
		if (!group) throw new HttpException('Group does not exist', 400);
		if (group.muted.find(member => member.id === user.id)) throw new HttpException('User already muted', 400);
		group.muted.push(user);
		await this.groupRepository.save(group);
		setTimeout(async () => {
			const group = await this.getGroupByName(name);
			if (!group) throw new HttpException('Group does not exist', 400);
			group.muted = group.muted.filter(member => member.id !== user.id);
			await this.groupRepository.save(group);
		}, timeToMute);
	}

	async add(user: Users, groupName: string, password: string) {
		const group = await this.getGroupByName(groupName);
		
			if (!group)
				throw new HttpException('Group does not exist', 400);
		
			if (group.members.find(member => member.id === user.id))
				throw new HttpException('You\'re already in this group', 400);
			else if (group.admins.find(admin => admin.id === user.id))
				throw new HttpException('You\'re already in this group', 400);
			else if (group.owner.id === user.id)
				throw new HttpException('You\'re already in this group', 400);
			else if (group.status === GroupStatus.private)
				throw new HttpException('Group is private', 400);
			else if (group.password) {
				if (!await bcrypt.compare(password, group.password))
					throw new HttpException('Wrong password', 400);
			}

		group.members.push(user);
		return await this.groupRepository.save(group);
	}

	async addMember(admin: Users, userName: string, groupName: string) {
		const group = await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.name = :groupName", { groupName })
		.andWhere("(owner.name = :name OR admins.name = :name)", { name: admin.name })
		.getOne();

		if (!group)
			throw new HttpException('You\'re not an admin', 400);
		const user = await this.userServices.getUserByName(userName);
		if (!user)
			throw new HttpException('User does not exist', 400);
		else if (group.members.find(member => member.id === user.id))
			throw new HttpException('You\'re already in this group', 400);
		else if (group.admins.find(admin => admin.id === user.id))
			throw new HttpException('You\'re already in this group', 400);
		else if (group.owner.id === user.id)
			throw new HttpException('You\'re already in this group', 400);
		group.members.push(user);
		return await this.groupRepository.save(group);
	}
	
	async makeAdmin(admin: Users, userName: string, groupName: string) {
		const group = await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.name = :groupName", { groupName })
		.andWhere("(owner.name = :name OR admins.name = :name)", { name: admin.name })
		.getOne();

		if (!group) throw new HttpException('You\'re not an admin', 400);
		const user = await this.userServices.getUserByName(userName);
		if (!user) throw new HttpException('User does not exist', 400);
		if (group.admins.find(admin => admin.id === user.id)) throw new HttpException('User already admin', 400);
		if (group.members.find(member => member.id === user.id)) {
			group.admins.push(group.members.find(member => member.id === user.id))
			group.members = group.members.filter(member => member.id !== user.id);
			return await this.groupRepository.save(group);
		}
		else throw new HttpException('User not in group or is already an admin', 400);
	}

	async removeMember(admin: Users, userName: string, groupName: string) {
		const group = await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.name = :groupName", { groupName })
		.andWhere("(owner.name = :name OR admins.name = :name)", { name: admin.name })
		.getOne();

		if (!group)
			throw new HttpException('You\'re not an admin', 400);
		const user = await this.userServices.getUserByName(userName);
		if (!user)
			throw new HttpException('User does not exist', 400);
		
		if (group.members.find(member => member.id === user.id)) {
			group.members = group.members.filter(member => member.id !== user.id);
			return await this.groupRepository.save(group);
		}
		else if (group.admins.find(admin => admin.id === user.id)) {
			if ((await this.getGroupByName(groupName)).owner.name !== admin.name) throw new HttpException('You\'re not the owner', 400);
			group.admins = group.admins.filter(admin => admin.id !== user.id);
			return await this.groupRepository.save(group);
		}
		else
			throw new HttpException('User not in group', 400);
	}

	async leaveGroup(admin: Users, groupName: string) {
		const group = await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.name = :groupName", { groupName })
		.getOne();

		if (admin.name === group.owner.name) {
			if (group.admins.length) {
				group.owner = group.admins[0];
				group.admins.shift();
			}
			else if (group.members.length) {
				group.owner = group.members[0];
				group.members.shift();
			}
			else return await this.groupRepository.delete({ id: group.id })
		}
		else if (group.admins.find(admin => admin.name === admin.name) || group.members.find(member => member.name === admin.name)) {
			group.admins = group.admins.filter((member) => member.id !== admin.id);
			group.members = group.members.filter((member) => member.id !== admin.id);
		}
		else throw new HttpException('You\'re not in this group', 400);
		return await this.groupRepository.save(group);
	}

	async changeStatus(admin: Users, groupName: string, status: string) {
		const group = await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.name = :groupName", { groupName })
		.andWhere("(owner.name = :name)", { name: admin.name })
		.getOne();

		
		if (!group) {
			throw new HttpException('You\'re not an admin', 400);
		}
		if (GroupStatus[status] === undefined) {
			throw new HttpException('Invalid status', 400);
		}
		group.status = GroupStatus[status];
		return await this.groupRepository.save(group);
	}

	async getGroupsList(user: Users): Promise<Groups[]> {
		return await this.groupRepository.createQueryBuilder("groups")
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("owner.id = :owner", { owner: user.id })
		.orWhere("admins.id = :admin", { admin: user.id })
		.orWhere("members.id = :member", { member: user.id })
		.getMany();
	}

	async getGroupById(id: number): Promise<Groups> {
		return await this.groupRepository.createQueryBuilder("groups")
		.select()
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.where("groups.id = :id", { id })
		.getOne();
	}

	async getGroupByName(name: string): Promise<Groups> {
		return await this.groupRepository.createQueryBuilder("groups")
		.select()
		.leftJoinAndSelect("groups.owner", "owner")
		.leftJoinAndSelect("groups.admins", "admins")
		.leftJoinAndSelect("groups.members", "members")
		.leftJoinAndSelect("groups.muted", "muted")
		.leftJoinAndSelect("groups.chat", "chat")
		.where("groups.name = :name", { name })
		.getOne();
	}
}