import { 
  ComplaintsRepository, 
  RepliesRepository, 
  ReactionsRepository, 
  CompensationsRepository,
  EscalationsRepository 
} from '../data/repositories';

export class ComplaintService {
  static async listComplaints() {
    const complaints = await ComplaintsRepository.list();
    return this.#transformComplaintsData(complaints);
  }

  static async createComplaint(complaintData, userId) {
    const complaint = {
      title: complaintData.title,
      description: complaintData.description,
      mood: complaintData.mood,
      category: complaintData.category,
      severity: complaintData.severity,
      user_id: userId,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    const result = await ComplaintsRepository.create(complaint);
    return this.#transformComplaintData(result);
  }

  static async addReply(complaintId, content, userId) {
    const replyData = {
      complaint_id: complaintId,
      content,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    const reply = await RepliesRepository.create(replyData);
    return this.#transformReplyData(reply);
  }

  static async updateReaction(complaintId, reaction, userId) {
    if (!reaction) {
      await ReactionsRepository.delete(complaintId, userId);
      return null;
    }

    const reactionData = {
      complaint_id: complaintId,
      reaction,
      user_id: userId
    };

    const updatedReaction = await ReactionsRepository.upsert(reactionData);
    return this.#transformReactionData(updatedReaction);
  }

  static async addCompensation(replyId, options, userId) {
    const compensationData = {
      reply_id: replyId,
      options,
      user_id: userId
    };

    const compensation = await CompensationsRepository.create(compensationData);
    return this.#transformCompensationData(compensation);
  }

  static async revealCompensation(compensationId, selectedOption) {
    const compensation = await CompensationsRepository.reveal(compensationId, selectedOption);
    return this.#transformCompensationData(compensation);
  }

  static async escalateComplaint(complaintId, status, userId) {
    const complaint = await EscalationsRepository.updateStatus(complaintId, status, userId);
    return this.#transformComplaintData(complaint);
  }

  static async createPlea(complaintId, content, userId) {
    const plea = await EscalationsRepository.createPlea(complaintId, content, userId);
    return this.#transformPleaData(plea);
  }

  static async resolvePlea(pleaId, status, userId) {
    const plea = await EscalationsRepository.updatePleaStatus(pleaId, status, userId);
    return this.#transformPleaData(plea);
  }

  // Private transformation methods
  static #transformComplaintsData(complaints) {
    return complaints.map(complaint => this.#transformComplaintData(complaint));
  }

  static #transformComplaintData(complaint) {
    return {
      ...complaint,
      user: complaint.creator || {
        user_id: complaint.user_id,
        username: complaint.user_id === '2' ? 'Vishu' : 'Sabaa'
      },
      escalatedBy: complaint.escalator,
      status: complaint.status || 'pending',
      replies: (complaint.replies || []).map(reply => this.#transformReplyData(reply)),
      pleas: (complaint.pleas || []).map(plea => this.#transformPleaData(plea))
    };
  }

  static #transformReplyData(reply) {
    const compensations = Array.isArray(reply.compensations) ? reply.compensations : 
      (reply.compensations ? [reply.compensations] : []);

    return {
      ...reply,
      user: reply.author || {
        user_id: reply.user_id,
        username: reply.user_id === '2' ? 'Vishu' : 'Sabaa'
      },
      compensations: compensations.map(comp => this.#transformCompensationData(comp)),
      hasCompensation: compensations.length > 0
    };
  }

  static #transformReactionData(reaction) {
    return {
      ...reaction,
      user: reaction.creator || {
        user_id: reaction.user_id,
        username: reaction.user_id === '2' ? 'Vishu' : 'Sabaa'
      }
    };
  }

  static #transformCompensationData(compensation) {
    return {
      ...compensation,
      options: Array.isArray(compensation.options) ? compensation.options : [],
      status: compensation.status || 'pending',
      selected_option: compensation.selected_option || null,
      user: compensation.creator || {
        user_id: compensation.user_id,
        username: compensation.user_id === '2' ? 'Vishu' : 'Sabaa'
      }
    };
  }

  static #transformPleaData(plea) {
    return {
      ...plea,
      user: plea.author || {
        user_id: plea.user_id,
        username: plea.user_id === '2' ? 'Vishu' : 'Sabaa'
      },
      resolvedBy: plea.resolver,
      status: plea.status || 'pending'
    };
  }
} 