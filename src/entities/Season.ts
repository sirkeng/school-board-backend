import { PrimaryGeneratedColumn, Column, OneToMany, Entity } from 'typeorm';
import { Sport } from './Sport';

@Entity('seasons')
export class Season {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    seasonName: string;

    @OneToMany(() => Sport, sport => sport.season)
    sports: Sport[];
}
