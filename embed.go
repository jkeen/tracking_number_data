package tracking

import "embed"

//go:embed couriers/*
var Couriers embed.FS

// Glossary says what each named part of a number is, for every format that has one.
//
//go:embed glossary.json
var Glossary embed.FS
