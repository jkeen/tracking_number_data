package tracking_test

import (
	"fmt"
	"os"
	"testing"

	tracking "github.com/jkeen/tracking_number_data"
)

func TestEmbed(t *testing.T) {
	dir, err := os.ReadDir("couriers")
	if err != nil {
		t.Fatal(err)
	}

	files := make([]string, 0, len(dir))
	for _, f := range dir {
		name := f.Name()
		if len(name) > 5 && name[len(name)-5:] == ".json" {
			files = append(files, name)
		}
	}

	if len(files) == 0 {
		t.Fatal("no files found")
	}

	for _, f := range files {
		embedBytes, err := tracking.Couriers.ReadFile(fmt.Sprintf("couriers/%s", f))
		if err != nil {
			t.Fatal(err)
		}

		fsBytes, err := os.ReadFile(fmt.Sprintf("couriers/%s", f))
		if err != nil {
			t.Fatal(err)
		}

		if string(embedBytes) != string(fsBytes) {
			t.Fatalf("%s: embedded file does not match filesystem file", f)
		}
	}
}
