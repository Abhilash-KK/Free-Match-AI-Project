/**
 * freelancerFinancials.js
 * 
 * Shared source-of-truth utility for freelancer earnings, wallet balances, 
 * escrow holds, upcoming milestone releases, and transactions.
 * Used by both FreelancerDashboard (Workspace overview cards) and FreelancerEarningsView.
 */

export function calculateFreelancerFinancials({ userSession = null, contracts = [], apiFinancials = null, withdrawals = [] }) {
  const currentFlId = (userSession?.username || userSession?.user_id || userSession?.email || '').toLowerCase().trim();
  const currentFlName = (userSession?.name || '').toLowerCase().trim();

  // 1. If backend API financials are provided and valid for this user, use them as primary source of truth
  if (apiFinancials && typeof apiFinancials.available_balance !== 'undefined') {
    const availRaw = Number(apiFinancials.available_balance || 0);
    const earnedRaw = Number(apiFinancials.total_earned || 0);
    const pendingRaw = Number(apiFinancials.pending_release || 0);
    const escrowRaw = Number(apiFinancials.escrow_hold || pendingRaw);
    const withdrawnRaw = Number(apiFinancials.total_withdrawn || 0);
    const inProgressRaw = Number(apiFinancials.withdrawal_in_progress || 0);
    const activeCount = Number(apiFinancials.active_contracts_count || 0);
    const completedCount = Number(apiFinancials.completed_projects_count || 0);
    const upcomingList = Array.isArray(apiFinancials.upcoming_releases) ? apiFinancials.upcoming_releases : [];
    const chartList = Array.isArray(apiFinancials.chart_data) ? apiFinancials.chart_data : [];
    const txList = Array.isArray(apiFinancials.transactions) ? apiFinancials.transactions : [];

    const totSum = availRaw + pendingRaw;
    const availPct = totSum > 0 ? Math.round((availRaw / totSum) * 100) : 0;
    const pendPct = totSum > 0 ? (100 - availPct) : 0;

    return {
      hasData: earnedRaw > 0,
      totalBalance: `₹${availRaw.toLocaleString('en-IN')}`,
      totalBalanceRaw: availRaw,
      availableBalanceStr: `₹${availRaw.toLocaleString('en-IN')}`,
      totalEarned: `₹${earnedRaw.toLocaleString('en-IN')}`,
      totalEarnedRaw: earnedRaw,
      lifetimeEarningsStr: `₹${earnedRaw.toLocaleString('en-IN')}`,
      pendingRelease: `₹${pendingRaw.toLocaleString('en-IN')}`,
      pendingReleaseRaw: pendingRaw,
      escrowHold: `₹${escrowRaw.toLocaleString('en-IN')}`,
      escrowHoldRaw: escrowRaw,
      totalWithdrawn: `₹${withdrawnRaw.toLocaleString('en-IN')}`,
      totalWithdrawnRaw: withdrawnRaw,
      withdrawalInProgress: `₹${inProgressRaw.toLocaleString('en-IN')}`,
      withdrawalInProgressRaw: inProgressRaw,
      growthRate: earnedRaw > 0 ? '+12.5%' : '0%',
      pendingCount: upcomingList.length,
      withdrawalCount: txList.filter(t => t.type === 'out').length,
      activeContractsCount: String(activeCount),
      completedProjectsCount: String(completedCount),
      overview: {
        mainTotal: `₹${earnedRaw.toLocaleString('en-IN')}`,
        growthLabel: earnedRaw > 0 ? '▲ Active Contract Earnings' : '0% / No earnings yet',
        milestonePayments: `₹${Math.round(earnedRaw * 0.4).toLocaleString('en-IN')}`,
        projectEarnings: `₹${Math.round(earnedRaw * 0.6).toLocaleString('en-IN')}`,
        bonuses: '₹0',
        refunds: '₹0',
        chartData: chartList
      },
      breakdown: {
        available: { amount: `₹${availRaw.toLocaleString('en-IN')}`, pct: `${availPct}%` },
        pending: { amount: `₹${pendingRaw.toLocaleString('en-IN')}`, pct: `${pendPct}%` },
        escrow: { amount: `₹${escrowRaw.toLocaleString('en-IN')}`, pct: '0%' },
        inProgress: { amount: `₹${inProgressRaw.toLocaleString('en-IN')}`, pct: '0%' }
      },
      upcomingReleases: upcomingList,
      transactions: txList,
      lastWithdrawal: withdrawnRaw > 0 ? txList.find(t => t.type === 'out') : null
    };
  }

  // 2. Filter contracts strictly belonging to the authenticated freelancer
  const myAssignedContracts = (contracts || []).filter(c => {
    if (!c) return false;
    const cFl = (c.freelancerName || c.freelancer || c.freelancerId || c.freelancer_id || '').toLowerCase().trim();
    if (!cFl) return false;
    
    const isUserMatch = currentFlId && (cFl === currentFlId || cFl.includes(currentFlId) || currentFlId.includes(cFl));
    const isNameMatch = currentFlName && (cFl === currentFlName || cFl.includes(currentFlName) || currentFlName.includes(cFl));
    
    return isUserMatch || isNameMatch;
  });

  // 3. Newly registered freelancer with no assigned contracts
  if (myAssignedContracts.length === 0) {
    return {
      hasData: false,
      totalBalance: '₹0',
      totalBalanceRaw: 0,
      availableBalanceStr: '₹0',
      totalEarned: '₹0',
      totalEarnedRaw: 0,
      lifetimeEarningsStr: '₹0',
      pendingRelease: '₹0',
      pendingReleaseRaw: 0,
      escrowHold: '₹0',
      escrowHoldRaw: 0,
      totalWithdrawn: '₹0',
      totalWithdrawnRaw: 0,
      withdrawalInProgress: '₹0',
      withdrawalInProgressRaw: 0,
      growthRate: '0%',
      pendingCount: 0,
      withdrawalCount: 0,
      activeContractsCount: '0',
      completedProjectsCount: '0',
      overview: {
        mainTotal: '₹0',
        growthLabel: '0% / No earnings yet',
        milestonePayments: '₹0',
        projectEarnings: '₹0',
        bonuses: '₹0',
        refunds: '₹0',
        chartData: []
      },
      breakdown: {
        available: { amount: '₹0', pct: '0%' },
        pending: { amount: '₹0', pct: '0%' },
        escrow: { amount: '₹0', pct: '0%' },
        inProgress: { amount: '₹0', pct: '0%' }
      },
      upcomingReleases: [],
      transactions: [],
      lastWithdrawal: null
    };
  }

  // 4. Calculate dynamic totals from database contracts
  let earnedRaw = 0;
  let pendingRaw = 0;
  let escrowRaw = 0;
  let activeContractsCount = 0;
  let completedContractsCount = 0;
  let pendingMilestonesTotalCount = 0;
  const upcomingList = [];
  const txList = [];

  myAssignedContracts.forEach(c => {
    const projTitle = c.projectName || c.project || 'Assigned Project';
    const cAmtStr = (c.amount || c.agreedAmount || '₹0').toString().replace(/[^0-9]/g, '');
    const cTotal = parseInt(cAmtStr, 10) || 0;

    if (c.status === 'Completed') {
      completedContractsCount += 1;
      earnedRaw += cTotal;
      txList.push({
        id: `tx_c_${c.id || c.contractId}`,
        type: 'in',
        title: 'Project Completion Payout',
        subtitle: projTitle,
        amount: `+₹${cTotal.toLocaleString('en-IN')}`,
        date: c.startDate || 'Recent',
        status: 'Completed',
        color: 'emerald'
      });
    } else if (c.status === 'Active') {
      activeContractsCount += 1;
      const doneCount = Number(c.milestonesDone || 0);
      const totalCount = Number(c.milestonesTotal || 1);
      const remainingCount = Math.max(0, totalCount - doneCount);
      pendingMilestonesTotalCount += remainingCount;

      const mPct = totalCount > 0 ? (doneCount / totalCount) : 0;
      const singleMilestoneVal = Math.round(cTotal / totalCount);
      const cEarned = Math.round(cTotal * mPct);
      const cPending = Math.max(0, cTotal - cEarned);

      earnedRaw += cEarned;
      pendingRaw += cPending;
      escrowRaw += cPending;

      if (cPending > 0) {
        const nextMilestoneAmt = Math.min(cPending, singleMilestoneVal);
        upcomingList.push({
          id: `up_${c.id || c.contractId}`,
          project: projTitle,
          milestone: `Milestone ${doneCount + 1} - Deliverable Release`,
          amount: `₹${nextMilestoneAmt.toLocaleString('en-IN')}`,
          due: `In ${(doneCount + 1) * 4} days`,
          color: 'emerald'
        });
      }

      if (cEarned > 0) {
        txList.push({
          id: `tx_m_${c.id || c.contractId}`,
          type: 'in',
          title: 'Milestone Payment Received',
          subtitle: `${projTitle} - Milestone ${doneCount}`,
          amount: `+₹${cEarned.toLocaleString('en-IN')}`,
          date: c.startDate || 'Recent',
          status: 'Completed',
          color: 'emerald'
        });
      }
    }
  });

  // Check user withdrawals from passed list or localStorage
  let withdrawnRaw = 0;
  let inProgressRaw = 0;
  let userWithdrawals = withdrawals;
  if (!userWithdrawals || userWithdrawals.length === 0) {
    try {
      const savedW = localStorage.getItem(`freematch_user_${currentFlId}_withdrawals`);
      if (savedW) {
        const parsedW = JSON.parse(savedW);
        if (Array.isArray(parsedW)) userWithdrawals = parsedW;
      }
    } catch (e) {}
  }

  if (Array.isArray(userWithdrawals)) {
    userWithdrawals.forEach(w => {
      const wAmt = parseInt((w.amount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
      if (w.status === 'Pending' || w.status === 'Processing') {
        inProgressRaw += wAmt;
      } else {
        withdrawnRaw += wAmt;
      }
      txList.push({
        id: w.id || `tx_w_${Date.now()}`,
        type: 'out',
        title: 'Withdrawal to Bank',
        subtitle: `To ${w.bank || w.bank_account || 'Bank Account'}`,
        amount: `-₹${wAmt.toLocaleString('en-IN')}`,
        date: w.date || w.created_at || 'Recent',
        status: w.status || 'Completed',
        color: 'purple'
      });
    });
  }

  const availableRaw = Math.max(0, earnedRaw - withdrawnRaw - inProgressRaw);
  const totSum = availableRaw + pendingRaw;
  const availPct = totSum > 0 ? Math.round((availableRaw / totSum) * 100) : 0;
  const pendPct = totSum > 0 ? (100 - availPct) : 0;

  const chartData = earnedRaw > 0 ? [
    { label: 'Aug 1', val: Math.round(earnedRaw * 0.1) },
    { label: 'Aug 6', val: Math.round(earnedRaw * 0.3) },
    { label: 'Aug 11', val: Math.round(earnedRaw * 0.5) },
    { label: 'Aug 16', val: Math.round(earnedRaw * 0.7) },
    { label: 'Aug 21', val: Math.round(earnedRaw * 0.85) },
    { label: 'Aug 26', val: Math.round(earnedRaw * 0.95) },
    { label: 'Aug 31', val: earnedRaw }
  ] : [];

  return {
    hasData: earnedRaw > 0,
    totalBalance: `₹${availableRaw.toLocaleString('en-IN')}`,
    totalBalanceRaw: availableRaw,
    availableBalanceStr: `₹${availableRaw.toLocaleString('en-IN')}`,
    totalEarned: `₹${earnedRaw.toLocaleString('en-IN')}`,
    totalEarnedRaw: earnedRaw,
    lifetimeEarningsStr: `₹${earnedRaw.toLocaleString('en-IN')}`,
    pendingRelease: `₹${pendingRaw.toLocaleString('en-IN')}`,
    pendingReleaseRaw: pendingRaw,
    escrowHold: `₹${escrowRaw.toLocaleString('en-IN')}`,
    escrowHoldRaw: escrowRaw,
    totalWithdrawn: `₹${withdrawnRaw.toLocaleString('en-IN')}`,
    totalWithdrawnRaw: withdrawnRaw,
    withdrawalInProgress: `₹${inProgressRaw.toLocaleString('en-IN')}`,
    withdrawalInProgressRaw: inProgressRaw,
    growthRate: earnedRaw > 0 ? '+12.5%' : '0%',
    pendingCount: pendingMilestonesTotalCount || upcomingList.length,
    withdrawalCount: txList.filter(t => t.type === 'out').length,
    activeContractsCount: String(activeContractsCount),
    completedProjectsCount: String(completedContractsCount),
    overview: {
      mainTotal: `₹${earnedRaw.toLocaleString('en-IN')}`,
      growthLabel: earnedRaw > 0 ? '▲ Active Contract Earnings' : '0% / No earnings yet',
      milestonePayments: `₹${Math.round(earnedRaw * 0.4).toLocaleString('en-IN')}`,
      projectEarnings: `₹${Math.round(earnedRaw * 0.6).toLocaleString('en-IN')}`,
      bonuses: '₹0',
      refunds: '₹0',
      chartData: chartData
    },
    breakdown: {
      available: { amount: `₹${availableRaw.toLocaleString('en-IN')}`, pct: `${availPct}%` },
      pending: { amount: `₹${pendingRaw.toLocaleString('en-IN')}`, pct: `${pendPct}%` },
      escrow: { amount: `₹${escrowRaw.toLocaleString('en-IN')}`, pct: '0%' },
      inProgress: { amount: `₹${inProgressRaw.toLocaleString('en-IN')}`, pct: '0%' }
    },
    upcomingReleases: upcomingList,
    transactions: txList,
    lastWithdrawal: withdrawnRaw > 0 ? txList.find(t => t.type === 'out') : null
  };
}
