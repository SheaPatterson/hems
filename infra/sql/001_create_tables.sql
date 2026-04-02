-- ============================================================================
-- Azure SQL Schema Migration: HEMS Ops Center
-- Recreates all Supabase PostgreSQL tables in Azure SQL
-- Preserves snake_case column naming for backward compatibility
-- Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
-- ============================================================================

-- ============================================================================
-- 1. hospitals
-- ============================================================================
CREATE TABLE hospitals (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    name            NVARCHAR(255)    NOT NULL,
    city            NVARCHAR(255)    NOT NULL,
    faa_identifier  NVARCHAR(20)     NULL,
    latitude        DECIMAL(10,7)    NOT NULL DEFAULT 0,
    longitude       DECIMAL(10,7)    NOT NULL DEFAULT 0,
    is_trauma_center BIT             NOT NULL DEFAULT 0,
    trauma_level    INT              NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_hospitals PRIMARY KEY (id)
);

-- ============================================================================
-- 2. helicopters
-- ============================================================================
CREATE TABLE helicopters (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    model               NVARCHAR(255)    NOT NULL,
    registration        NVARCHAR(50)     NOT NULL,
    fuel_capacity_lbs   DECIMAL(10,2)    NOT NULL DEFAULT 0,
    cruise_speed_kts    DECIMAL(10,2)    NOT NULL DEFAULT 0,
    fuel_burn_rate_lb_hr DECIMAL(10,2)   NOT NULL DEFAULT 450,
    image_url           NVARCHAR(2048)   NULL,
    maintenance_status  NVARCHAR(50)     NOT NULL DEFAULT 'FMC',
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_helicopters PRIMARY KEY (id),
    CONSTRAINT UQ_helicopters_registration UNIQUE (registration)
);

-- ============================================================================
-- 3. hems_bases
-- ============================================================================
CREATE TABLE hems_bases (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    name            NVARCHAR(255)    NOT NULL,
    location        NVARCHAR(255)    NOT NULL,
    contact         NVARCHAR(255)    NULL,
    faa_identifier  NVARCHAR(20)     NULL,
    latitude        DECIMAL(10,7)    NOT NULL DEFAULT 0,
    longitude       DECIMAL(10,7)    NOT NULL DEFAULT 0,
    helicopter_id   UNIQUEIDENTIFIER NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_hems_bases PRIMARY KEY (id),
    CONSTRAINT FK_hems_bases_helicopter FOREIGN KEY (helicopter_id)
        REFERENCES helicopters(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. missions
-- ============================================================================
CREATE TABLE missions (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    mission_id          NVARCHAR(255)    NOT NULL,
    user_id             NVARCHAR(255)    NOT NULL,
    callsign            NVARCHAR(100)    NOT NULL,
    mission_type        NVARCHAR(50)     NOT NULL,
    status              NVARCHAR(50)     NOT NULL DEFAULT 'active',
    hems_base           NVARCHAR(MAX)    NULL,
    helicopter          NVARCHAR(MAX)    NULL,
    crew                NVARCHAR(MAX)    NULL,
    origin              NVARCHAR(MAX)    NULL,
    pickup              NVARCHAR(MAX)    NULL,
    destination         NVARCHAR(MAX)    NULL,
    patient_age         INT              NULL,
    patient_gender      NVARCHAR(50)     NULL,
    patient_weight_lbs  DECIMAL(10,2)    NULL,
    patient_details     NVARCHAR(MAX)    NULL,
    medical_response    NVARCHAR(MAX)    NULL,
    waypoints           NVARCHAR(MAX)    NULL,
    tracking            NVARCHAR(MAX)    NULL,
    live_data           NVARCHAR(MAX)    NULL,
    pilot_notes         NVARCHAR(MAX)    NULL,
    performance_score   DECIMAL(5,2)     NULL,
    flight_summary      NVARCHAR(MAX)    NULL,
    created_at          DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_missions PRIMARY KEY (id),
    CONSTRAINT UQ_missions_mission_id UNIQUE (mission_id)
);

-- ============================================================================
-- 5. profiles
-- ============================================================================
CREATE TABLE profiles (
    id              NVARCHAR(255)    NOT NULL,
    first_name      NVARCHAR(255)    NULL,
    last_name       NVARCHAR(255)    NULL,
    avatar_url      NVARCHAR(2048)   NULL,
    location        NVARCHAR(255)    NULL,
    email_public    NVARCHAR(255)    NULL,
    simulators      NVARCHAR(500)    NULL,
    experience      NVARCHAR(500)    NULL,
    bio             NVARCHAR(MAX)    NULL,
    social_links    NVARCHAR(MAX)    NULL,
    is_subscribed   BIT              NOT NULL DEFAULT 0,
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_profiles PRIMARY KEY (id)
);

-- ============================================================================
-- 6. user_roles
-- ============================================================================
CREATE TABLE user_roles (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    user_id         NVARCHAR(255)    NOT NULL,
    role_id         NVARCHAR(50)     NOT NULL,
    CONSTRAINT PK_user_roles PRIMARY KEY (id)
);

-- ============================================================================
-- 7. achievements
-- ============================================================================
CREATE TABLE achievements (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    user_id         NVARCHAR(255)    NOT NULL,
    type            NVARCHAR(100)    NOT NULL,
    awarded_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_achievements PRIMARY KEY (id)
);

-- ============================================================================
-- 8. community_posts
-- ============================================================================
CREATE TABLE community_posts (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    user_id         NVARCHAR(255)    NOT NULL,
    title           NVARCHAR(500)    NOT NULL,
    content         NVARCHAR(MAX)    NOT NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_community_posts PRIMARY KEY (id)
);

-- ============================================================================
-- 9. incident_reports
-- ============================================================================
CREATE TABLE incident_reports (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    mission_id      NVARCHAR(255)    NOT NULL,
    user_id         NVARCHAR(255)    NOT NULL,
    report_type     NVARCHAR(50)     NOT NULL,
    severity        NVARCHAR(50)     NOT NULL,
    description     NVARCHAR(MAX)    NOT NULL,
    actions_taken   NVARCHAR(MAX)    NULL,
    status          NVARCHAR(50)     NOT NULL DEFAULT 'Open',
    resolution      NVARCHAR(MAX)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_incident_reports PRIMARY KEY (id)
);

-- ============================================================================
-- 10. notams
-- ============================================================================
CREATE TABLE notams (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    title           NVARCHAR(500)    NOT NULL,
    message         NVARCHAR(MAX)    NOT NULL,
    severity        NVARCHAR(50)     NOT NULL DEFAULT 'info',
    active          BIT              NOT NULL DEFAULT 1,
    user_id         NVARCHAR(255)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_notams PRIMARY KEY (id)
);

-- ============================================================================
-- 11. downloads
-- ============================================================================
CREATE TABLE downloads (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    category        NVARCHAR(255)    NOT NULL,
    title           NVARCHAR(500)    NOT NULL,
    file_url        NVARCHAR(2048)   NOT NULL,
    description     NVARCHAR(MAX)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_downloads PRIMARY KEY (id)
);

-- ============================================================================
-- 12. config
-- ============================================================================
CREATE TABLE config (
    [key]           NVARCHAR(255)    NOT NULL,
    value           NVARCHAR(MAX)    NOT NULL,
    description     NVARCHAR(MAX)    NULL,
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_config PRIMARY KEY ([key])
);

-- ============================================================================
-- 13. logs
-- ============================================================================
CREATE TABLE logs (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [timestamp]     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    level           NVARCHAR(50)     NOT NULL,
    message         NVARCHAR(MAX)    NOT NULL,
    CONSTRAINT PK_logs PRIMARY KEY (id)
);

-- ============================================================================
-- 14. mission_radio_logs
-- ============================================================================
CREATE TABLE mission_radio_logs (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    mission_id      NVARCHAR(255)    NOT NULL,
    sender          NVARCHAR(50)     NOT NULL,
    message         NVARCHAR(MAX)    NOT NULL,
    [timestamp]     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    callsign        NVARCHAR(100)    NULL,
    user_id         NVARCHAR(255)    NULL,
    CONSTRAINT PK_mission_radio_logs PRIMARY KEY (id)
);

-- ============================================================================
-- 15. global_dispatch_logs
-- ============================================================================
CREATE TABLE global_dispatch_logs (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    sender          NVARCHAR(50)     NOT NULL,
    message         NVARCHAR(MAX)    NOT NULL,
    [timestamp]     DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    callsign        NVARCHAR(100)    NULL,
    user_id         NVARCHAR(255)    NULL,
    CONSTRAINT PK_global_dispatch_logs PRIMARY KEY (id)
);

-- ============================================================================
-- 16. content_pages
-- ============================================================================
CREATE TABLE content_pages (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    slug            NVARCHAR(255)    NOT NULL,
    title           NVARCHAR(500)    NOT NULL,
    content         NVARCHAR(MAX)    NOT NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_content_pages PRIMARY KEY (id),
    CONSTRAINT UQ_content_pages_slug UNIQUE (slug)
);

-- ============================================================================
-- 17. base_scenery
-- ============================================================================
CREATE TABLE base_scenery (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    base_id         NVARCHAR(255)    NOT NULL,
    image_urls      NVARCHAR(MAX)    NULL,
    zip_url         NVARCHAR(2048)   NULL,
    description     NVARCHAR(MAX)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_base_scenery PRIMARY KEY (id)
);

-- ============================================================================
-- 18. hospital_scenery
-- ============================================================================
CREATE TABLE hospital_scenery (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    hospital_id     NVARCHAR(255)    NOT NULL,
    image_urls      NVARCHAR(MAX)    NULL,
    zip_url         NVARCHAR(2048)   NULL,
    description     NVARCHAR(MAX)    NULL,
    created_at      DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_hospital_scenery PRIMARY KEY (id)
);

-- ============================================================================
-- 19. telemetry_summary
-- Note: This is a lightweight materialized view in Azure SQL.
-- In the target architecture, Cosmos DB handles raw telemetry,
-- but this table supports the useMissions/useActiveMissions queries.
-- ============================================================================
CREATE TABLE telemetry_summary (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    mission_id          NVARCHAR(255)    NOT NULL,
    latitude            DECIMAL(10,7)    NOT NULL DEFAULT 0,
    longitude           DECIMAL(10,7)    NOT NULL DEFAULT 0,
    phase               NVARCHAR(50)     NULL,
    fuel_remaining_lbs  DECIMAL(10,2)    NULL,
    last_update         BIGINT           NULL,
    CONSTRAINT PK_telemetry_summary PRIMARY KEY (id)
);

-- ============================================================================
-- 20. live_pilot_status
-- Note: In the target architecture, Cosmos DB with TTL handles this.
-- This Azure SQL table exists for migration compatibility and fallback.
-- ============================================================================
CREATE TABLE live_pilot_status (
    id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    user_id             NVARCHAR(255)    NOT NULL,
    last_seen           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    latitude            DECIMAL(10,7)    NOT NULL DEFAULT 0,
    longitude           DECIMAL(10,7)    NOT NULL DEFAULT 0,
    altitude_ft         DECIMAL(10,2)    NOT NULL DEFAULT 0,
    ground_speed_kts    DECIMAL(10,2)    NOT NULL DEFAULT 0,
    heading_deg         DECIMAL(10,2)    NOT NULL DEFAULT 0,
    fuel_remaining_lbs  DECIMAL(10,2)    NOT NULL DEFAULT 0,
    phase               NVARCHAR(50)     NULL DEFAULT 'Online',
    callsign            NVARCHAR(100)    NOT NULL DEFAULT 'UNIT',
    CONSTRAINT PK_live_pilot_status PRIMARY KEY (id)
);

-- ============================================================================
-- INDEXES
-- Requirement 3.5: Indexes on user_id, mission_id, and status columns
-- ============================================================================

-- missions indexes
CREATE NONCLUSTERED INDEX IX_missions_user_id   ON missions (user_id);
CREATE NONCLUSTERED INDEX IX_missions_status     ON missions (status);
CREATE NONCLUSTERED INDEX IX_missions_user_status ON missions (user_id, status);

-- user_roles indexes
CREATE NONCLUSTERED INDEX IX_user_roles_user_id ON user_roles (user_id);

-- achievements indexes
CREATE NONCLUSTERED INDEX IX_achievements_user_id ON achievements (user_id);

-- community_posts indexes
CREATE NONCLUSTERED INDEX IX_community_posts_user_id ON community_posts (user_id);

-- incident_reports indexes
CREATE NONCLUSTERED INDEX IX_incident_reports_mission_id ON incident_reports (mission_id);
CREATE NONCLUSTERED INDEX IX_incident_reports_user_id    ON incident_reports (user_id);
CREATE NONCLUSTERED INDEX IX_incident_reports_status     ON incident_reports (status);

-- notams indexes
CREATE NONCLUSTERED INDEX IX_notams_user_id ON notams (user_id);

-- mission_radio_logs indexes
CREATE NONCLUSTERED INDEX IX_mission_radio_logs_mission_id ON mission_radio_logs (mission_id);
CREATE NONCLUSTERED INDEX IX_mission_radio_logs_user_id    ON mission_radio_logs (user_id);

-- global_dispatch_logs indexes
CREATE NONCLUSTERED INDEX IX_global_dispatch_logs_user_id ON global_dispatch_logs (user_id);

-- telemetry_summary indexes
CREATE NONCLUSTERED INDEX IX_telemetry_summary_mission_id ON telemetry_summary (mission_id);

-- live_pilot_status indexes
CREATE NONCLUSTERED INDEX IX_live_pilot_status_user_id   ON live_pilot_status (user_id);
CREATE NONCLUSTERED INDEX IX_live_pilot_status_last_seen ON live_pilot_status (last_seen);

-- base_scenery indexes
CREATE NONCLUSTERED INDEX IX_base_scenery_base_id ON base_scenery (base_id);

-- hospital_scenery indexes
CREATE NONCLUSTERED INDEX IX_hospital_scenery_hospital_id ON hospital_scenery (hospital_id);

-- logs indexes
CREATE NONCLUSTERED INDEX IX_logs_timestamp ON logs ([timestamp]);
CREATE NONCLUSTERED INDEX IX_logs_level     ON logs (level);
