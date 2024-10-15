import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Season } from './Season';
import { DetailSport } from './DetailSport';

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

    @OneToMany(() => DetailSport, detailSport => detailSport.sport)
    detailSport: DetailSport[];
}
