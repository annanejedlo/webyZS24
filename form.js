class Form {

  evaluateAnswers() {
    console.log("zavolana fce class Form/evaluateAnswers")
    var currCircle = 0;

    const q1 = document.getElementById('q1')
    const q2 = document.getElementById('q2')
    const q3 = document.getElementById('q3') 
    const q4 = document.getElementById('q4')
    const q5 = document.getElementById('q5')
    const q6 = document.getElementById('q6')
    const q7 = document.getElementById('q7')
    const q8 = document.getElementById('q8') 
    const q9 = document.getElementById('q9')

    const q = [q1, q2, q3, q4, q5, q6, q7, q8, q9]

    for(let i of q) {
      checkForBiggValue(i)
    }

    function checkForBiggValue(a) {
      if (a.checked) {
        if (a.value > currCircle) {
          currCircle = a.value;
        }
      }
    }

    console.log("current circle of hell: " + currCircle)
    this.showResult(currCircle)

  }

  showResult(a) {
    const result = document.getElementById('AnswersResult')
    result.innerHTML = a

    const saveForm = document.getElementById('saveResultsForm')
    saveForm.style.visibility = "visible";
    
  }
 
}

const form = new Form();

function evalAnswers() {
  form.evaluateAnswers();
}
