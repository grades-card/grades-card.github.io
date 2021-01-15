
const clearButton = document.querySelector('.clear-button');
clearButton.addEventListener('click', () => {
  const courseInputElt = document.getElementById('course');
  courseInputElt.value = '';
  clearButton.style.display = 'none';
});

function courseAutocomplete() {
  const courseInputElt = document.getElementById('course');
  if (courseInputElt.value.length > 0) {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
  }
  const match = document.getElementById('course').value.match(/\((.*)\)/);
  if (!match) {
    return;
  }
  const course = document.getElementById('course').value.match(/\((.*)\)/)[1];

  if (flattenedGrades[course]) {
    document.getElementById('course-name').textContent = `${flattenedGrades[course][0][2]} - (${course})`;
    if (flattenedGrades[course].Prof)
      document.getElementById('prof-name').textContent = `${flattenedGrades[course].Prof}`;
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    const courseData = flattenedGrades[course].sort((a,b) => `${b[0]}${b[1]}`.localeCompare(`${a[0]}${a[1]}`));
    console.log(courseData);

    const tableColContainer = document.getElementById('table-columns');
    tableColContainer.innerHTML = `<th>Academic Session</th>
    <th>Semester</th>`;
    [sess, sem, _, gradeObj] = courseData[0];
    Object.keys(gradeObj).sort().forEach((grade) => {
      const listItem = document.createElement('li');
      const listName = document.createElement('em');
      const numbers = document.createElement('span');
      numbers.textContent = gradeObj[grade];
      listName.textContent = grade.trim();
      listItem.appendChild(listName);
      listItem.appendChild(numbers);
      legend.appendChild(listItem);
    });
    document.getElementById('acad-session').innerHTML = `${sess} - ${sem}`;
    const total = Object.values(gradeObj).reduce(function(a, b){
      return a + b;
    }, 0);
    document.getElementById('total-students').textContent = `Total students - ${total}`;
    
    createPie('.pieID.legend', '.pieID.pie');

    /**
     * Table
     */
    function union(setA, setB) {
      let _union = new Set(setA)
      for (let elem of setB) {
          _union.add(elem)
      }
      return _union
    }
    columns = new Set()
    courseData.forEach((data) => {
      [sess, sem, _, gradeObj] = data;
      columns = union(columns, new Set(Object.keys(gradeObj)));
    });
    const indexStore = {};
    [...columns].sort().forEach((v,i) => {
      indexStore[v] = i
      const elt = document.createElement('th');
      elt.innerText = v.trim();
      tableColContainer.appendChild(elt);
    });

    // Table
    const elt = document.createElement('th');
    elt.innerText = 'Total';
    tableColContainer.appendChild(elt);

    const tableDataContainer = document.getElementById('table-body');
    tableDataContainer.innerHTML = '';
    courseData.forEach((data, index) => {
      [sess, sem, _, gradeObj] = data;
      
      const row = document.createElement('tr');
      row.innerHTML = `<td>${sess}</td><td>${sem}</td>`;

      [...columns].sort().forEach((v, i) => {
        const elt = document.createElement('td');
        elt.innerText = '0';
        if (gradeObj[v]) {
          elt.innerText = gradeObj[v];
        }
        row.appendChild(elt);
      });

      const total = Object.values(gradeObj).reduce(function(a, b){
        return a + b;
      }, 0);
      const elt = document.createElement('td');
      elt.innerText = total;
      row.appendChild(elt);
      tableDataContainer.appendChild(row);
    });
    $(document).ready( function () {
      $('#table_id').DataTable();
    });

  }
}
let flattenedGrades = null;
enableForm = () => {
  console.log('Form Enabled!');
  const autocompleteData = {};

  const courseAutocompleteInstances = M.Autocomplete.init(document.querySelectorAll('#course'), {
    onAutocomplete: courseAutocomplete,
    minLength: 0,
  });

  document.getElementById('course-list').innerHTML = '';
  document.getElementById('course').value = '';

  if (flattenedGrades) {
    document.getElementById('course').disabled = false;
    const updateData = {};
    const instance = M.Autocomplete.getInstance(document.getElementById('course'));
    Object.keys(flattenedGrades).forEach((courseID) => {
      updateData[`${flattenedGrades[courseID][0][2]} - (${courseID})`] = null;
    });
    instance.updateData(updateData);
  }

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const session = searchParams.get('year');
  const sem = searchParams.get('sem');
  const course = searchParams.get('cno');
  // const session = yea
  // console.log(year,sem,cno);
  if (flattenedGrades[session] && flattenedGrades[session][sem] && flattenedGrades[session][sem][course]) {
    document.getElementById('course-name').textContent = `${flattenedGrades[session][sem][course].CourseName} - (${course})`;
    console.log(flattenedGrades[session][sem][course]);
    if (flattenedGrades[session][sem][course].Prof)
      document.getElementById('prof-name').textContent = `${flattenedGrades[session][sem][course].Prof}`;
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    const { CourseName, Grades } = flattenedGrades[session][sem][course];
    Object.keys(Grades).sort().forEach((grade) => {
      if (grade !== 'Total') {
        const listItem = document.createElement('li');
        const listName = document.createElement('em');
        const numbers = document.createElement('span');
        numbers.textContent = Grades[grade];
        listName.textContent = grade.trim();
        listItem.appendChild(listName);
        listItem.appendChild(numbers);
        legend.appendChild(listItem);
      }
    });
    document.getElementById('total-students').textContent = `Total students - ${flattenedGrades[session][sem][course].Grades.Total}`;
    createPie('.pieID.legend', '.pieID.pie');
  }
};
fetch('/Grades.json')
  .then((res) => res.json())
  .then((grades) => {
    flattenedGrades = grades;
    enableForm();
  });
const courseList = document.getElementById('course-list');

document.getElementById('course').addEventListener('input', courseAutocomplete);

function sliceSize(dataNum, dataTotal) {
  return (dataNum / dataTotal) * 360;
}
function addSlice(sliceSize, pieElement, offset, sliceID, color) {
  $(pieElement).append(`<div class='slice ${sliceID}'><span></span></div>`);
  var offset = offset - 1;
  const sizeRotation = -179 + sliceSize;
  $(`.${sliceID}`).css({
    transform: `rotate(${offset}deg) translate3d(0,0,0)`,
  });
  $(`.${sliceID} span`).css({
    transform: `rotate(${sizeRotation}deg) translate3d(0,0,0)`,
    'background-color': color,
  });
}
function iterateSlices(sliceSize, pieElement, offset, dataCount, sliceCount, color) {
  const sliceID = `s${dataCount}-${sliceCount}`;
  const maxSize = 179;
  if (sliceSize <= maxSize) {
    addSlice(sliceSize, pieElement, offset, sliceID, color);
  } else {
    addSlice(maxSize, pieElement, offset, sliceID, color);
    iterateSlices(sliceSize - maxSize, pieElement, offset + maxSize, dataCount, sliceCount + 1, color);
  }
}
function createPie(dataElement, pieElement) {
  const listData = [];
  $(`${dataElement} span`).each(function () {
    listData.push(Number($(this).html()));
  });
  let listTotal = 0;
  for (var i = 0; i < listData.length; i++) {
    listTotal += listData[i];
  }
  let offset = 0;
  const color = [
    'cornflowerblue',
    'olivedrab',
    'orange',
    'tomato',
    'crimson',
    'purple',
    'turquoise',
    'forestgreen',
    'navy',
    'gray',
  ];
  for (var i = 0; i < listData.length; i++) {
    const size = sliceSize(listData[i], listTotal);
    iterateSlices(size, pieElement, offset, i, 0, color[i]);
    $(`${dataElement} li:nth-child(${i + 1})`).css('border-color', color[i]);
    offset += size;
  }
}
createPie('.pieID.legend', '.pieID.pie');
