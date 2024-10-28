import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DetailSport } from './DetailSport';

@Entity('recent_games')
export class RecentGame {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    location: string;

    @Column()
    timestamp: Date;

    @ManyToOne(() => DetailSport, detailSport => detailSport.awards)
    detailSport: DetailSport;
}
