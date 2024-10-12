import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1728660067585 implements MigrationInterface {
    name = 'Migration1728660067585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_file" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_c6771f226a8149de690641d11ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('adminStudent', 'teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "role" "public"."users_role_enum" NOT NULL, "email_token" character varying, "email_token_expiry" TIMESTAMP, "reset_password_token" character varying, "reset_password_expiry" TIMESTAMP, "refresh_token" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "points" ("id" SERIAL NOT NULL, "team" character varying NOT NULL, "event" character varying NOT NULL, "score" integer NOT NULL, "date" TIMESTAMP NOT NULL, CONSTRAINT "PK_57a558e5e1e17668324b165dadf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "board_id" integer NOT NULL, "category_id" integer, "title" character varying NOT NULL, "content" text NOT NULL, "season" character varying, "likes_count" integer NOT NULL DEFAULT '0', "comments_count" integer NOT NULL DEFAULT '0', "is_carousel" boolean NOT NULL DEFAULT false, "is_anonymous" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_file" ("id" SERIAL NOT NULL, "post_id" character varying NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_92d3b60cdcdd57e2ea334c1b26d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "post_id" integer NOT NULL, "content" character varying NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_comment_id" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "post_id" integer, "comment_id" integer, CONSTRAINT "UQ_fdb7601e93963d8ee5bc2ac9270" UNIQUE ("user_id", "comment_id"), CONSTRAINT "UQ_723da61de46f65bb3e3096750d2" UNIQUE ("user_id", "post_id"), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "mime" character varying NOT NULL, "size" integer NOT NULL, "url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."competitions_type_enum" AS ENUM('team', 'individual')`);
        await queryRunner.query(`CREATE TABLE "competitions" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "board_id" integer NOT NULL, "category_id" integer NOT NULL, "name" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "type" "public"."competitions_type_enum" NOT NULL, "award" character varying, "result" character varying, CONSTRAINT "PK_ef273910798c3a542b475e75c7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "competitors" ("id" SERIAL NOT NULL, "name" character varying, "score" integer, "competition_id" integer, CONSTRAINT "PK_76a451dd0c8a51a0e0fb6284389" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment_file" ("id" SERIAL NOT NULL, "comment_id" character varying NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_82d253ec0eee2847f7aed08cbf4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coach_file" ("id" SERIAL NOT NULL, "coach_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "PK_07137ac94c072cc5ac8a7deef6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coaches" ("id" SERIAL NOT NULL, "category_id" integer NOT NULL, "year" integer NOT NULL, "season" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, CONSTRAINT "PK_eddaece1a1f1b197fa39e6864a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "board_id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "boards" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_606923b0b068ef262dfdcd18f44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_93ce08bdbea73c0c7ee673ec35a" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competitors" ADD CONSTRAINT "FK_7919d24780dfa2cb02fcb5aea35" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competitors" DROP CONSTRAINT "FK_7919d24780dfa2cb02fcb5aea35"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_93ce08bdbea73c0c7ee673ec35a"`);
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "coaches"`);
        await queryRunner.query(`DROP TABLE "coach_file"`);
        await queryRunner.query(`DROP TABLE "comment_file"`);
        await queryRunner.query(`DROP TABLE "competitors"`);
        await queryRunner.query(`DROP TABLE "competitions"`);
        await queryRunner.query(`DROP TYPE "public"."competitions_type_enum"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "post_file"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "points"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_file"`);
    }

}
