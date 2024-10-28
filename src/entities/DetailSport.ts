import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Sport } from './Sport';
import { Award } from './Award';
import { RecentGame } from './RecentGame';

@Entity('detail_sports')
export class DetailSport {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Sport, sport => sport.detailSport)
    sport: Sport;

    @Column()
    bannerTitle: string;

    @Column()
    bannerImageUrl: string;

    @Column()
    coachName: string;

    @Column()
    coachDescription: string;

    @Column()
    coachProfileImageUrl: string;

    @Column()
    recentGameTitle: string;

    @Column()
    recentGameDescription: string;

    @Column()
    seasonNumber: string;

    @Column()
    seasonDetail: string;

    @Column()
    seasonImageUrl: string;

    @OneToMany(() => Award, award => award.detailSport)
    awards: Award[];

    @OneToMany(() => RecentGame, recentGame => recentGame.detailSport)
    recentGames: RecentGame[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
