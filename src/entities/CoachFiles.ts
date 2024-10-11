import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CoachFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    coachId: number;

    @Column()
    fileId: number;
}
