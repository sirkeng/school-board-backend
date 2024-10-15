import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DetailSport } from './DetailSport';

@Entity('awards')
export class Award {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @ManyToOne(() => DetailSport, detailSport => detailSport.awards)
    detailSport: DetailSport;
}
