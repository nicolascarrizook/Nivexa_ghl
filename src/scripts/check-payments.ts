import { supabase } from '../config/supabase';

async function checkPayments() {
  const projectId = '92cfdfa8-e2bf-487e-b6c3-d0171aa142d6';

  // Get project contractors
  const { data: contractors } = await supabase
    .from('project_contractors')
    .select('id, contractor_id')
    .eq('project_id', projectId);

  console.log('Contractors:', contractors);

  if (!contractors || contractors.length === 0) {
    console.log('No contractors found');
    return;
  }

  // Get payments
  const { data: payments } = await supabase
    .from('contractor_payments')
    .select('id, budget_item_id, amount, status, payment_type')
    .eq('project_contractor_id', contractors[0].id);

  console.log('Payments:', JSON.stringify(payments, null, 2));

  // Get budget items
  const { data: budgetItems } = await supabase
    .from('contractor_budgets')
    .select('id, description, total_amount')
    .eq('project_contractor_id', contractors[0].id);

  console.log('Budget Items:', JSON.stringify(budgetItems, null, 2));
}

checkPayments();