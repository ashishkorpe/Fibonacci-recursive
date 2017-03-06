var myApp = angular.module('myApp',[]);
myApp.controller('myController',['$scope','$http',function($scope,$http){
	$scope.calculateSeq = function(inputNumber){
		var number1 = {
			number: inputNumber
		};
		var value = "";
		var sequence = "";
		$scope.newArray = "";
			$http.post('/',number1).success(function(response){
				$scope.enteredNumber = response.value;
				console.log(response.value);			
				$scope.array = response.sequence;
				console.log(response.sequence);
				return response;
			});
	};													 					
	$scope.shuffle = function(array){
		var i,j,temp;
		for(i=array.length;i>0;i--){
			j=Math.floor(Math.random()*i);
			temp = array[i-1];
			array[i-1] = array[j];
			array[j] = temp;
		}
 		$scope.shuffledArray = array;
	};
}]);