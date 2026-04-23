const db = require('./models');

async function checkTodayCheckins() {
  try {
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`Checking check-ins for today: ${localToday}`);
    
    const checkIns = await db.CheckIn.findAll({
      where: { check_in_date: localToday }
    });
    
    console.log('Today\'s check-ins:', JSON.stringify(checkIns, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTodayCheckins();
