-- Coaching Application Database Schema
-- MySQL 9 compatible schema

CREATE DATABASE IF NOT EXISTS coaching_app;
USE coaching_app;

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    target_type ENUM('team', 'member') NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create many-to-many relationship table for team members and teams
CREATE TABLE IF NOT EXISTS member_teams (
    team_member_id INT,
    team_id INT,
    PRIMARY KEY (team_member_id, team_id),
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_feedback_target ON feedbacks(target_type, target_id);
CREATE INDEX idx_member_teams_team ON member_teams(team_id);
CREATE INDEX idx_member_teams_member ON member_teams(team_member_id);

-- Insert sample data for testing
INSERT INTO team_members (name, email, picture) VALUES
('John Doe', 'john.doe@example.com', 'https://via.placeholder.com/150/1'),
('Jane Smith', 'jane.smith@example.com', 'https://via.placeholder.com/150/2'),
('Bob Johnson', 'bob.johnson@example.com', 'https://via.placeholder.com/150/3'),
('Alice Brown', 'alice.brown@example.com', 'https://via.placeholder.com/150/4');

INSERT INTO teams (name, logo) VALUES
('Development Team', 'https://via.placeholder.com/100/dev'),
('Design Team', 'https://via.placeholder.com/100/design'),
('QA Team', 'https://via.placeholder.com/100/qa');

-- Assign some members to teams
INSERT INTO member_teams (team_member_id, team_id) VALUES
(1, 1), -- John Doe -> Development Team
(2, 1), -- Jane Smith -> Development Team
(3, 2), -- Bob Johnson -> Design Team
(4, 3); -- Alice Brown -> QA Team

-- Insert sample feedback
INSERT INTO feedbacks (content, target_type, target_id) VALUES
('Excellent work on the new feature implementation!', 'member', 1),
('Great collaboration and team spirit.', 'team', 1),
('Outstanding design work on the user interface.', 'member', 3),
('The QA process has been very thorough this sprint.', 'team', 3);

-- Show created tables
SHOW TABLES;