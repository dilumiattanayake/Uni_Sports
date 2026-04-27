/**
 * Coach Assignment API Tests
 * Run these tests to verify the coach assignment functionality
 */

const request = require('supertest');
const app = require('../server'); // Your express app
const Sport = require('../models/Sport');
const User = require('../models/User');

describe('Sport Coach Management', () => {
  let sportId;
  let coachId1;
  let coachId2;
  let adminToken;

  // Setup: Create test data before running tests
  beforeAll(async () => {
    // Create admin user and get token
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Test@123',
        role: 'admin'
      });
    adminToken = adminRes.body.token;

    // Create sport
    const sportRes = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Basketball',
        description: 'Test Sport',
        category: 'team',
        imageUrl: 'https://example.com/image.jpg'
      });
    sportId = sportRes.body.data._id;

    // Create coach 1
    const coach1Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Coach One',
        email: 'coach1@test.com',
        password: 'Coach@123',
        role: 'coach',
        specialization: 'Basketball'
      });
    coachId1 = coach1Res.body.data._id;

    // Create coach 2
    const coach2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Coach Two',
        email: 'coach2@test.com',
        password: 'Coach@123',
        role: 'coach',
        specialization: 'Volleyball'
      });
    coachId2 = coach2Res.body.data._id;
  });

  // Test 1: Get Sport Coaches (Initially Empty)
  describe('GET /api/sports/:id/coaches', () => {
    it('should return empty coaches array for new sport', async () => {
      const res = await request(app)
        .get(`/api/sports/${sportId}/coaches`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('should return 404 for non-existent sport', async () => {
      const res = await request(app)
        .get(`/api/sports/invalid_id/coaches`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Test 2: Get Available Coaches
  describe('GET /api/sports/:id/available-coaches', () => {
    it('should return all active coaches for new sport', async () => {
      const res = await request(app)
        .get(`/api/sports/${sportId}/available-coaches`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/sports/${sportId}/available-coaches`);

      expect(res.status).toBe(401);
    });

    it('should require admin role', async () => {
      // Create student token (non-admin)
      const studentRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student User',
          email: 'student@test.com',
          password: 'Student@123',
          role: 'student'
        });
      const studentToken = studentRes.body.token;

      const res = await request(app)
        .get(`/api/sports/${sportId}/available-coaches`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  // Test 3: Assign Coach to Sport
  describe('POST /api/sports/:id/coaches/:coachId', () => {
    it('should successfully assign coach to sport', async () => {
      const res = await request(app)
        .post(`/api/sports/${sportId}/coaches/${coachId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('assigned');
      expect(res.body.data.coaches).toHaveLength(1);
      expect(res.body.data.coaches[0]._id).toBe(coachId1);
    });

    it('should verify coach is added to User.assignedSports', async () => {
      const coach = await User.findById(coachId1);
      expect(coach.assignedSports).toContain(sportId);
    });

    it('should prevent duplicate coach assignment', async () => {
      const res = await request(app)
        .post(`/api/sports/${sportId}/coaches/${coachId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already assigned');
    });

    it('should return 404 for non-existent sport', async () => {
      const res = await request(app)
        .post(`/api/sports/invalid_id/coaches/${coachId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Sport not found');
    });

    it('should return 404 for non-existent coach', async () => {
      const res = await request(app)
        .post(`/api/sports/${sportId}/coaches/invalid_id`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Coach not found');
    });

    it('should prevent assigning non-coach users', async () => {
      // Create a student
      const studentRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student',
          email: 'student2@test.com',
          password: 'Student@123',
          role: 'student'
        });
      const studentId = studentRes.body.data._id;

      const res = await request(app)
        .post(`/api/sports/${sportId}/coaches/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not a coach');
    });

    it('should allow assigning second coach', async () => {
      const res = await request(app)
        .post(`/api/sports/${sportId}/coaches/${coachId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.coaches).toHaveLength(2);
    });
  });

  // Test 4: Get Sport Coaches (After Assignment)
  describe('GET /api/sports/:id/coaches (After Assignment)', () => {
    it('should return assigned coaches', async () => {
      const res = await request(app)
        .get(`/api/sports/${sportId}/coaches`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      const coachIds = res.body.data.map(c => c._id);
      expect(coachIds).toContain(coachId1);
      expect(coachIds).toContain(coachId2);
    });
  });

  // Test 5: Remove Coach from Sport
  describe('DELETE /api/sports/:id/coaches/:coachId', () => {
    it('should successfully remove coach from sport', async () => {
      const res = await request(app)
        .delete(`/api/sports/${sportId}/coaches/${coachId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed');
      expect(res.body.data.coaches).toHaveLength(1);
      expect(res.body.data.coaches[0]._id).toBe(coachId2);
    });

    it('should verify coach is removed from User.assignedSports', async () => {
      const coach = await User.findById(coachId1);
      expect(coach.assignedSports).not.toContain(sportId);
    });

    it('should return 400 when removing unassigned coach', async () => {
      const res = await request(app)
        .delete(`/api/sports/${sportId}/coaches/${coachId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not assigned');
    });

    it('should return 404 for non-existent sport', async () => {
      const res = await request(app)
        .delete(`/api/sports/invalid_id/coaches/${coachId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // Test 6: Get Available Coaches (After Assignment)
  describe('GET /api/sports/:id/available-coaches (After Assignment)', () => {
    it('should exclude assigned coaches from available list', async () => {
      const res = await request(app)
        .get(`/api/sports/${sportId}/available-coaches`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const availableIds = res.body.data.map(c => c._id);
      expect(availableIds).not.toContain(coachId2); // Still assigned
      expect(availableIds).toContain(coachId1); // Removed, now available
    });
  });

  // Cleanup: Remove test data after all tests
  afterAll(async () => {
    await Sport.deleteOne({ _id: sportId });
    await User.deleteMany({ email: { $in: [
      'admin@test.com',
      'coach1@test.com',
      'coach2@test.com',
      'student@test.com',
      'student2@test.com'
    ]}});
  });
});
