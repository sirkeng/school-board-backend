import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Season } from './Season';

@Entity('sports')
export class Sport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sportName: string;

    @Column()
    imageUrl: string;

    @ManyToOne(() => Season, season => season.sports)
    season: Season;
}
