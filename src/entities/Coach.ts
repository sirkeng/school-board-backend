import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('coaches')
export class Coach {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryId: number;

    @Column()
    year: number;

    @Column()
    season: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    image: string;
}
