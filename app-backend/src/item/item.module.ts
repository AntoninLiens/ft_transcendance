import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemService } from "./item.services";
import { Module } from "@nestjs/common";
import Item from "./item.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Item]),
	],
	providers: [ ItemService ],
	exports: [ ItemService ]
})
export default class ItemModule {}