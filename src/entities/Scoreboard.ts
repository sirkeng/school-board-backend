import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('scoreboard')
export class Scoreboard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sportName: string;

    @Column()
    firstTeam: string;

    @Column()
    secondTeam: string;

    @Column()
    firstTeamScore: number;

    @Column()
    secondTeamScore: number;

    @Column()
    liveLink: string;
}
