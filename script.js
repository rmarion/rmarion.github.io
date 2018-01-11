var topPadding = 20;
var topHoverPadding = 30;

var leftWidth = 150;
var leftHoverWidth = 160;

$(document).ready(function() {
	/* Left Button Hover Functions */
	$('.left').mouseenter(function() {
		$(this).animate({
			width: leftHoverWidth,
		}, 50);
		$(this).addClass('left-hover');
	})
	$('.left').mouseleave(function() {
		$(this).animate({
			width: leftWidth
		}, 50);
		$(this).removeClass('left-hover');
	})
	/* Top Banner Hover Functions */
	$('.top-li').mouseenter(function() {
		$(this).addClass('top-hover');
	})
	$('.top-li').mouseleave(function() {
		$(this).removeClass('top-hover');
	})
	/* Left Button Load Functions (load in large central div) */
	$('#demoa').click(function() {
		$('.container-right').load('./DemoA/demoa.html');
	})	
	$('#demob').click(function() {
		$('.container-right').load('./DemoB/demob.html');
	})	
	$('#democ').click(function() {
		$('.container-right').load('./DemoC/democ.html');
	})	
	$('#demod').click(function() {
		$('.container-right').load('./DemoD/demod.html');
	})	
	$('#demoe').click(function() {
		$('.container-right').load('./DemoE/demoe.html');
	})	
	$('#demof').click(function() {
		$('.container-right').load('./DemoF/demof.html');
	})	
	$('#demog').click(function() {
		$('.container-right').load('./DemoG/demog.html');
	})	
	$('#demoh').click(function() {
		$('.container-right').load('./DemoH/demoh.html');
	})	
	$('#contact').click(function() {
		$('.container-right').load('./Contact/contact.html');

});


