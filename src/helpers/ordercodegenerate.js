exports.ordercodegenerate = async (url) => {
  try {

    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const currentYear = now.getFullYear().toString();
    retValue = `BFSORD${currentMonth}${currentYear}`;
  } catch(e) {
    retValue = '';
  }
  return retValue;
};
  