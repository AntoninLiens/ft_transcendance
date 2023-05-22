import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Users from "src/user/user.entity";

export enum ItemStatut {
	"Owned",
	"Equiped"
}

export interface Itemplate {
	id: number;
	name: string;
	price: number;
	description: string;
	image: string;
	category: ItemCategory;
}

export enum ItemCategory {
	"Background",
	"Ball",
	"Pad"
}

@Entity()
class Item {
	@PrimaryGeneratedColumn({ type: 'int' })
	id: number;

	@Column({ type: 'int' })
	itemId: number;

	@Column({ type: 'enum', enum: ItemStatut, default: ItemStatut.Owned })
	statut: ItemStatut;

	@Column({ type: 'enum', enum: ItemCategory })
	category: ItemCategory;

	@ManyToOne(() => Users, Users => Users.shop)
	owner: Users;
}
export default Item;